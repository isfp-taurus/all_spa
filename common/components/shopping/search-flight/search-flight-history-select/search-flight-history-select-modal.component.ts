import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { SupportModalBlockComponent } from '@lib/components/support-class';
import { CommonLibService } from '@lib/services/common-lib/common-lib.service';
import { SearchFlightHistoryState, ApiRequestState } from '@common/store/search-flight-history';
import { Observable } from 'rxjs/internal/Observable';

import {
  Bound as OnewayBounds,
  searchFlightInitialState,
  SearchFlightState,
  TripType,
  RoundTrip as newRoundTrip,
  SearchFlightConstant,
} from '@common/store/search-flight';
import {
  Bound,
  HstFvtModeEnum,
  RoundTrip,
  SearchFlightHistory,
  SearchFlightHistorySelectModalInput,
  RoundTripInfo,
  OnewayOrMultiCityInfo,
} from './search-flight-history-select.state';
import { SearchFlightHistoryStoreService } from '@common/services/store/search-flight/search-flight-history-store/search-flight-history-store.service';
import { HistoryFavoriteDeleteStoreService } from '@common/services/api-store/sdk-search/history-favorite-delete-store/history-favorite-delete-store.service';
import { HistoryFavoriteDeleteRequest, Items } from 'src/sdk-search';
import { ErrorType, PageType } from '@lib/interfaces';
import { FavoritePostService } from '../../../../services/api-store/sdk-search/favorite-post/favorite-post-store.service';
import { FavoritePostRequest } from 'src/sdk-search';
import { SearchFlightStoreService, ShoppingLibService } from '@common/services';
import { SearchFlightHistorySelectModalService } from './search-flight-history-select-modal.service';
import { AswMasterService, ErrorsHandlerService, PageLoadingService } from '@lib/services';
import { MasterStoreKey } from '@conf/asw-master.config';
import { StaticMsgPipe } from '@lib/pipes/static-msg/static-msg.pipe';
import { DateFormatPipe } from '@lib/pipes/date-format/date-format.pipe';
import { SearchFlightHistoryModalInitialState } from '@common/store/search-flight-history-modal';
import { ErrorCodeConstants } from '@conf/app.constants';

/**
 * 履歴・お気に入り登録のモーダル
 * 履歴orお気に入りは呼び出し元のinputで決定する
 */
@Component({
  selector: 'asw-search-flight-history-select-modal',
  templateUrl: './search-flight-history-select-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [FavoritePostService, HistoryFavoriteDeleteStoreService],
})
export class SearchFlightHistorySelectModalComponent extends SupportModalBlockComponent {
  constructor(
    private _searchFlightHistorySelectModalService: SearchFlightHistorySelectModalService,
    protected _common: CommonLibService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _searchFlightHistoryStoreService: SearchFlightHistoryStoreService,
    private _historyFavoriteDeleteStoreService: HistoryFavoriteDeleteStoreService,
    private _favoritePostService: FavoritePostService,
    private _aswMasterService: AswMasterService,
    private _errorsHandlerSvc: ErrorsHandlerService,
    private shoppingLibService: ShoppingLibService,
    private _staticMsg: StaticMsgPipe,
    private _dateFormatPipe: DateFormatPipe,
    private _searchFlightStoreService: SearchFlightStoreService,
    private _pageLoadingService: PageLoadingService
  ) {
    super(_common);
    this.mode = HstFvtModeEnum.reference;
    this.apiFetchState = 'unexecuted';
    this.SearchFlightHistoryData = SearchFlightHistoryModalInitialState;
    this._searchFlight = this._searchFlightStoreService.getData();
  }

  init(): void {
    this.historyType = this.payload.historyType;
    this.cabinListCache = this._aswMasterService.aswMaster[MasterStoreKey.M_LIST_DATA_930];
    if (this.historyType === 'history') {
      this.SearchFlightHistorySelectMethod = new HistoryMethod(
        this._staticMsg,
        this._dateFormatPipe,
        this.cabinListCache,
        this.shoppingLibService
      );
    } else {
      this.SearchFlightHistorySelectMethod = new FavoriteMethod(
        this._staticMsg,
        this._dateFormatPipe,
        this.cabinListCache,
        this.shoppingLibService
      );
    }
    this.subscribeService(
      'SearchFlightHistorySelectModalComponent-getState',
      this._searchFlightHistoryStoreService.SearchFlightHistoryModal$,
      (data) => {
        this.SearchFlightHistoryData = data;
        //お気に入りの値を取得する
        this.SearchFlightHistoryViewList = this.SearchFlightHistorySelectMethod.convertApiFetchToSearchFlightHistory(
          this.SearchFlightHistoryData
        );

        this.resize();
        this._changeDetectorRef.detectChanges();
      }
    );
  }

  destroy(): void {
    this.deleteSubscription('HistoryFavoriteDeleteStoreService');
    this.deleteSubscription('FavoritePostService');
  }

  reload(): void {}
  private cabinListCache = [];
  /**
   * 表示種別
   * history : 検索履歴一覧
   * favorite: お気に入り一覧
   */
  historyType!: 'history' | 'favorite';

  // 画面の状態
  /** 表示モード 0:参照モード 1:削除モード*/
  public mode: HstFvtModeEnum;
  public readonly HstFvtModeEnum = HstFvtModeEnum;

  /** 履歴・お気に入りを保持する変数 */
  public _SearchFlightHistoryData: SearchFlightHistoryState = SearchFlightHistoryModalInitialState;
  public get SearchFlightHistoryData(): SearchFlightHistoryState {
    return this._SearchFlightHistoryData;
  }
  public set SearchFlightHistoryData(value: SearchFlightHistoryState) {
    this._SearchFlightHistoryData = value;
    this.apiFetchState = this.SearchFlightHistoryData.apiRequestState;
  }
  /** 画面に描画する履歴・お気に入り一覧 履歴orお気に入りのどちらか一方のみ格納*/
  public SearchFlightHistoryViewList: Array<SearchFlightHistory> = [];
  public onewayOrMultiCity: Array<OnewayBounds> = [];
  public _searchFlight!: SearchFlightState;
  // ListのSize
  public index: number = 10;
  /** 履歴・お気に入り取得APIの実行状態 */
  public apiFetchState: ApiRequestState;
  /** 履歴・お気に入り取得APIを実行するオブザーバー */
  public apiFetch$!: Observable<any>;
  /** 履歴・お気に入り取得APIを保持する変数 */
  public apiFetchData!: any;

  /** 処理用インスタンス */
  private SearchFlightHistorySelectMethod!: SearchFlightHistorySelectMethod;

  /** サービスから受け取るデータ */
  override payload!: SearchFlightHistorySelectModalInput;

  /** INTERNAL_DESIGN_EVENT 削除モード切替リンク押下時処理 */
  public changeMode(event: Event): void {
    if (this.mode === HstFvtModeEnum.reference) {
      this.mode = HstFvtModeEnum.delete;
    } else {
      this.mode = HstFvtModeEnum.reference;
    }
  }

  /** INTERNAL_DESIGN_EVENT 検索履歴ボタン押下時処理・お気に入りボタン押下時処理 */
  public clickHistoryButton(event: Event, num: number) {
    event.preventDefault();
    this.mode = HstFvtModeEnum.reference;
    const state = this.SearchFlightHistorySelectMethod.convertHistoryToSearchFlightState(
      this.SearchFlightHistoryData,
      num,
      this._searchFlight
    );
    let searchFlight: SearchFlightState;
    if (state) {
      // 画面History選択　updateStore
      this.onewayOrMultiCity = [];
      state.onewayOrMultiCity.forEach((data) => {
        const onewayBound: OnewayBounds = {
          originLocationCode: data.originLocationCode,
          destinationLocationCode: data.destinationLocationCode,
          connectionLocationCode: data.connectionLocationCode,
          departureDate: data.departureDate,
          departureTimeWindowFrom: data.departureTimeWindowFrom,
          departureTimeWindowTo: data.departureTimeWindowTo,
        };
        this.onewayOrMultiCity.push(onewayBound);
      });
      const isJapanOnly = this.checkOnlyJapan(state);
      const dcsMigrationDateStatus = this.shoppingLibService.getDcsMigrationDateStatus(state);
      searchFlight = {
        ...this._searchFlight,
        tripType: state.tripType!,
        isJapanOnly: isJapanOnly,
        dcsMigrationDateStatus: dcsMigrationDateStatus,
        roundTrip: {
          departureOriginLocationCode: state.roundTrip.departureOriginLocationCode!,
          departureDestinationLocationCode: state.roundTrip.departureDestinationLocationCode!,
          departureDate: state.roundTrip.departureDate!,
          departureTimeWindowFrom: state.roundTrip.departureTimeWindowFrom!,
          departureTimeWindowTo: state.roundTrip.departureTimeWindowTo!,
          returnOriginLocationCode: state.roundTrip.returnOriginLocationCode!,
          returnDestinationLocationCode: state.roundTrip.returnDestinationLocationCode!,
          returnDate: state.roundTrip.returnDate!,
          returnTimeWindowFrom: state.roundTrip.returnTimeWindowFrom!,
          returnTimeWindowTo: state.roundTrip.returnTimeWindowTo!,
          departureConnection: {
            ...this._searchFlight.roundTrip.departureConnection,
            connectionLocationCode: state.roundTrip.departureConnection.connectionLocationCode!,
            connectionTime: state.roundTrip.departureConnection.connectionTime!,
          },
          returnConnection: {
            ...this._searchFlight.roundTrip.returnConnection,
            connectionLocationCode: state.roundTrip.returnConnection.connectionLocationCode!,
            connectionTime: state.roundTrip.returnConnection.connectionTime!,
          },
        },
        onewayOrMultiCity: this.onewayOrMultiCity,
        traveler: {
          adt: state.traveler.adt!,
          b15: state.traveler.b15!,
          chd: state.traveler.chd!,
          inf: state.traveler.inf!,
        },
        hasAccompaniedInAnotherReservation: state.hasAccompaniedInAnotherReservation,
        fare: {
          isMixedCabin: state.fare.isMixedCabin!,
          cabinClass: state.fare.cabinClass!,
          fareOptionType: state.fare.fareOptionType!,
          returnCabinClass: state.fare.returnCabinClass!,
        },
        promotion: {
          code: '',
        },
        searchPreferences: {
          getAirCalendarOnly: state.searchPreferences.getAirCalendarOnly!,
          getLatestOperation: state.searchPreferences.getLatestOperation!,
        },
        displayInformation: {
          compareFaresNearbyDates: state.displayInformation.compareFaresNearbyDates!,
          nextPage: state.displayInformation.nextPage!,
        },
        lowestPrice: {
          displayedTotalPrice: state.lowestPrice.displayedTotalPrice!,
          displayedBasePrice: state.lowestPrice.displayedBasePrice!,
          displayedCurrency: state.lowestPrice.displayedCurrency!,
        },
      };
      this._searchFlightStoreService.updateStore(searchFlight);
    }
    this.close();
    this._searchFlightHistorySelectModalService.itemSelect(this.historyType, searchFlight!);
    // 通知用文言設定エリアにメッセージタイプとしてpoliteMessage、
    // メッセージ内容として選択したお気に入りの内容が検索条件に反映された旨を指定する
    this._common.notificationStoreService.updateNotification({
      politeMessage: this._staticMsg.transform('reader.selectedSearchCondition'),
    });
  }

  /**　国内旅程判定 */
  private checkOnlyJapan(state: SearchFlightState): boolean {
    let preRoundTrip: RoundTripInfo | undefined;
    let preOnewayOrMulticity: Array<OnewayOrMultiCityInfo> | undefined;
    if (state.tripType === TripType.ROUND_TRIP) {
      preRoundTrip = {
        departureOriginLocationCode: state.roundTrip.departureOriginLocationCode,
        departureConnectionLocationCode: state.roundTrip.departureConnection.connectionLocationCode,
        departureDestinationLocationCode: state.roundTrip.departureDestinationLocationCode,
        returnConnectionLocationCode: state.roundTrip.returnConnection.connectionLocationCode,
      };
    } else {
      preOnewayOrMulticity = state.onewayOrMultiCity.map((data) => {
        return {
          originLocationCode: data.originLocationCode,
          destinationLocationCode: data.destinationLocationCode,
        };
      });
    }
    return this.shoppingLibService.checkJapanOnlyTrip(preRoundTrip, preOnewayOrMulticity);
  }

  /** INTERNAL_DESIGN_EVENT ゴミ箱ボタン押下時処理 */
  public clickHistoryDeleteButton(event: Event, num: number) {
    //API呼び出しパラメータを用意
    const historyFavoriteDeleteRequest: HistoryFavoriteDeleteRequest = {
      type: this.historyType,
      creationDateTime: this.SearchFlightHistoryViewList[num].creationDateTime,
    };
    this._pageLoadingService.startLoading();
    // 履歴・お気に入り削除API実行
    this._historyFavoriteDeleteStoreService.setHistoryFavoriteDeleteFromApi(historyFavoriteDeleteRequest);
    // 履歴・お気に入り削除API実行後処理
    this.subscribeService(
      'HistoryFavoriteDeleteStoreService',
      this._historyFavoriteDeleteStoreService.getDeleteHistoryFavorite(),
      (response) => {
        if (!response.isPending) {
          this._pageLoadingService.endLoading();
          // APIからエラーが返された場合
          if (response.isFailure) {
            this.close();

            const apiErr: string = this._common.apiError?.errors?.at(0)?.code ?? '';
            let errorMsgId;
            if (this.historyType === 'history') {
              errorMsgId = 'E0244';
            } else {
              errorMsgId = 'E0247';
            }
            this._errorsHandlerSvc.setRetryableError(PageType.PAGE, {
              errorMsgId: errorMsgId,
              apiErrorCode: apiErr,
            });
          } else {
            //成功時に画面上からも削除する
            //コンポーネント上に保持しているapi戻り値から1つ削除し、それを基に再描画処理を行う
            const state: SearchFlightHistoryState = this.SearchFlightHistorySelectMethod.spliceState(
              this.SearchFlightHistoryData,
              num
            );
            this._searchFlightHistoryStoreService.updateModalStore(state);
          }
        }
      }
    );
  }

  /** INTERNAL_DESIGN_EVENT お気に入り追加ボタン押下時処理 */
  public clickHistoryAddFavoriteButton(event: Event, num: number) {
    this.callApiAddFavorite(num);
  }

  /** 履歴・お気に入り追加APIの呼び出し */
  private callApiAddFavorite(num: number) {
    // 旅程種別により、apiのパラメータを設定する
    let round;
    let bounds;
    // 往復旅程
    if (this.SearchFlightHistoryViewList[num].roundTripFlag) {
      round = {
        originLocationCode: this.SearchFlightHistoryViewList[num].roundTrip?.originLocationCode!,
        destinationLocationCode: this.SearchFlightHistoryViewList[num].roundTrip?.destinationLocationCode!,
        departureTimeWindowFrom: this.SearchFlightHistoryViewList[num].roundTrip?.departureTimeWindowFrom,
        departureTimeWindowTo: this.SearchFlightHistoryViewList[num].roundTrip?.departureTimeWindowTo,
        returnTimeWindowFrom: this.SearchFlightHistoryViewList[num].roundTrip?.returnTimeWindowFrom,
        returnTimeWindowTo: this.SearchFlightHistoryViewList[num].roundTrip?.returnTimeWindowTo,
        departureDate: this.SearchFlightHistoryViewList[num].roundTrip?.departureDateUnformatted ?? '',
        returnDate: this.SearchFlightHistoryViewList[num].roundTrip?.returnDateUnformatted ?? '',
        departureConnectionLocationCode: this.SearchFlightHistoryViewList[num].roundTrip?.departureConnectionLocation,
        departureConnectionTime: this.SearchFlightHistoryViewList[num].roundTrip?.departureConnectionTime,
        returnConnectionLocationCode: this.SearchFlightHistoryViewList[num].roundTrip?.returnConnectionLocation,
        returnConnectionTime: this.SearchFlightHistoryViewList[num].roundTrip?.returnConnectionTime,
      };
    } else {
      // 複雑旅程
      bounds = this.SearchFlightHistoryViewList[num].bounds?.map((data) => {
        return {
          originLocationCode: data.originLocationCode,
          destinationLocationCode: data.destinationLocationCode,
          departureTimeWindowFrom: data.departureTimeWindowFrom,
          departureTimeWindowTo: data.departureTimeWindowTo,
          departureDate: data.departureDateUnformatted,
        };
      });
    }
    // API呼び出しパラメータを用意
    const favoritePostRequest: FavoritePostRequest = {
      favorite: {
        tripType: this.SearchFlightHistoryViewList[num].roundTripFlag ? 'roundtrip' : 'onewayOrMulticity',
        roundtrip: round,
        bounds: bounds,
        fare: {
          isMixedCabin: this.SearchFlightHistoryViewList[num].fare.isMixedCabin,
          cabinClass: this.SearchFlightHistoryViewList[num].fare.cabinClass,
          fareOptionType: this.SearchFlightHistoryViewList[num].fare.fareOptionType,
          mixedCabinClasses: {
            departureCabinClass: this.SearchFlightHistoryViewList[num].fare.mixedCabinClasses.departureCabinClass,
            returnCabinClass: this.SearchFlightHistoryViewList[num].fare.mixedCabinClasses.returnCabinClass,
          },
        },
        travelers: {
          ADT: this.SearchFlightHistoryViewList[num].travelers.ADT,
          B15: this.SearchFlightHistoryViewList[num].travelers.B15,
          CHD: this.SearchFlightHistoryViewList[num].travelers.CHD,
          INF: this.SearchFlightHistoryViewList[num].travelers.INF,
        },
        hasAccompaniedInAnotherReservation: this.SearchFlightHistoryViewList[num].hasAccompaniedInAnotherReservation,
        promotionCode: '',
      },
    };
    //お気に入り追加API実行
    this._favoritePostService.setFavoritePostFromApi(favoritePostRequest);
    this.subscribeService('FavoritePostService', this._favoritePostService.getFavoritePost(), (response) => {
      if (!response.isPending) {
        if (response.isFailure) {
          this.close();
          const apiErr: string = this._common.apiError?.errors?.at(0)?.code ?? '';
          if (apiErr === ErrorCodeConstants.ERROR_CODES.EBAZ000437) {
            this._errorsHandlerSvc.setRetryableError(PageType.PAGE, {
              errorMsgId: 'E0241',
              apiErrorCode: apiErr,
            });
          } else {
            this._errorsHandlerSvc.setNotRetryableError({
              errorType: ErrorType.SYSTEM,
              apiErrorCode: apiErr,
            });
          }
        } else {
          /** エラーが発生しない、お気に入り登録レスポンスが通知された場合、
          画面表示内容に従って、お気に入りモーダルに対象検索履歴を追加する。*/
          const arrayState = this.SearchFlightHistoryData.favorite!.concat();
          // 出発日をクリアする
          let favoriteItem = { ...this.SearchFlightHistoryData.histories![num] };
          if (favoriteItem.tripType === Items.TripTypeEnum.Roundtrip) {
            favoriteItem.roundtrip = { ...favoriteItem.roundtrip! };
            favoriteItem.roundtrip.departureDate = '';
            favoriteItem.roundtrip.returnDate = '';
          } else {
            favoriteItem.bounds = favoriteItem.bounds!.map((data) => {
              return { ...data, departureDate: '' };
            });
          }
          favoriteItem.creationDateTime = response.favorite?.creationDateTime;
          arrayState.unshift(favoriteItem);
          const state: SearchFlightHistoryState = {
            ...this.SearchFlightHistoryData,
            favorite: arrayState,
          };
          this._searchFlightHistoryStoreService.updateModalStore(state);
        }
      }
    });
  }
  public closeModal(event: Event): void {
    this.close();
  }
}

/**
 * 履歴・お気に入りモーダル処理部分の抽象クラス
 * 履歴かお気に入りかで処理が分岐するためTemplateMethodパターンで処理を分離
 */
abstract class SearchFlightHistorySelectMethod {
  constructor(
    private _staticMsg: StaticMsgPipe,
    private _dateFormatPipe: DateFormatPipe,
    private cabinListCache: any,
    private shoppingLibService: ShoppingLibService
  ) {}

  // Date型に変換
  public parseToDate(dateString?: string): Date | null {
    if (dateString) {
      const ymdList = dateString.split('-').map((str) => Number(str));
      return new Date(ymdList[0], ymdList[1] - 1, ymdList[2]);
    }
    return null;
  }

  /** 履歴・お気に入りのキャビン表記を検索条件用に変換するためのマップ */
  protected readonly CABIN_CLASS_CONVERT_MAP: { [key: string]: string } = {
    eco: 'eco',
    ecoPremium: 'ecoPremium',
    business: 'business',
    first: 'first',
  };

  /** 日付フォーマット変更処理 */
  public formatDate(dateString: string): string {
    if (dateString) {
      return this._dateFormatPipe.transform(dateString, 'default_departuredate');
    } else {
      return '';
    }
  }

  /** 時刻フォーマット変更処理 */
  public formatTime(timeString: string): string {
    if (timeString) {
      return this._dateFormatPipe.transform(timeString, 'default_departuredate.time');
    } else {
      return '';
    }
  }

  /** キャビンクラス名称取得 */
  getCabinClassName(cabinClass: string, type: 'domestic' | 'international') {
    if (type === 'domestic') {
      return this.cabinListCache.domestic.find((cabin: any) => {
        return cabin.value === cabinClass;
      })?.label;
    } else {
      return this.cabinListCache.international.find((cabin: any) => {
        return cabin.value === cabinClass;
      })?.label;
    }
  }

  /**　国内旅程判定 */
  checkDomestic(item: Items): 'domestic' | 'international' {
    let pRoundTrip = undefined;
    let paramOnewayOrMultiCity = undefined;
    if (item.tripType === Items.TripTypeEnum.Roundtrip) {
      const roundTrip = item.roundtrip!;
      pRoundTrip = {
        departureOriginLocationCode: roundTrip.originLocationCode,
        departureConnectionLocationCode: roundTrip.departureConnectionLocationCode!,
        departureDestinationLocationCode: roundTrip.destinationLocationCode,
        returnConnectionLocationCode: roundTrip.returnConnectionLocationCode ?? '',
      };
    } else {
      paramOnewayOrMultiCity = item.bounds!.map((data) => {
        return {
          originLocationCode: data.originLocationCode,
          destinationLocationCode: data.destinationLocationCode,
        };
      });
    }
    return this.shoppingLibService.checkJapanOnlyTrip(pRoundTrip, paramOnewayOrMultiCity)
      ? 'domestic'
      : 'international';
  }

  /** 空港名称取得 */
  private getAirportName(airportCode: string) {
    const airport = this.shoppingLibService.getAirportByRefCode(airportCode);
    if (airport) {
      return airport.airport_name;
    } else {
      if (airportCode === undefined || airportCode === null) {
        return airportCode;
      }
      return airportCode.endsWith('+') ? airportCode.slice(0, airportCode.length - 1) : airportCode;
    }
  }

  /** API取得結果を当画面描画用のデータに変換する */
  convertApiFetchToSearchFlightHistory(SearchFlightHistory: SearchFlightHistoryState) {
    const SearchFlightHistoryViewList: Array<SearchFlightHistory> = [];
    const historyList: Items[] = this.extractHistoryList(SearchFlightHistory);
    if (historyList.length === 0) {
      //履歴の長さが0の場合、履歴がない旨の表示に変更する
    } else {
      const week = 'm_list_data_PD_016_';
      let roundTrip: RoundTrip | null = null;
      let bounds: Array<Bound>;
      for (const response_history of historyList) {
        const tripDomesticFlg = this.checkDomestic(response_history);
        roundTrip = null;
        bounds = [];
        let roundTripFlag: boolean;
        if (response_history.tripType === 'roundtrip' && response_history.roundtrip != null) {
          roundTripFlag = true;
          //往復旅程の描画時に複数行を表示するかの判定
          let isMultiLine: boolean;
          if (
            response_history.fare?.isMixedCabin === true ||
            (response_history.roundtrip?.departureTimeWindowFrom && response_history.roundtrip.departureTimeWindowTo) ||
            (response_history.roundtrip?.returnTimeWindowFrom && response_history.roundtrip.returnTimeWindowTo) ||
            response_history.roundtrip?.departureConnectionLocationCode ||
            response_history.roundtrip?.returnConnectionLocationCode
          ) {
            isMultiLine = true;
          } else {
            isMultiLine = false;
          }
          roundTrip = {
            originLocationCode: response_history.roundtrip?.originLocationCode!,
            originLocationName: this.getAirportName(response_history.roundtrip?.originLocationCode!),
            destinationLocationCode: response_history.roundtrip?.destinationLocationCode!,
            destinationLocationName: this.getAirportName(response_history.roundtrip?.destinationLocationCode!),
            departureDate: response_history.roundtrip?.departureDate ?? '',
            departureDateUnformatted: response_history.roundtrip?.departureDate ?? '',
            departureTimeWindowFrom: response_history.roundtrip?.departureTimeWindowFrom!,
            departureTimeWindowTo: response_history.roundtrip?.departureTimeWindowTo!,
            departureTimeWindowFromName: '',
            departureTimeWindowToName: '',
            returnDate: response_history.roundtrip?.returnDate ?? '',
            returnDateUnformatted: response_history.roundtrip?.returnDate ?? '',
            returnTimeWindowFrom: response_history.roundtrip?.returnTimeWindowFrom!,
            returnTimeWindowTo: response_history.roundtrip?.returnTimeWindowTo!,
            returnTimeWindowFromName: '',
            returnTimeWindowToName: '',
            departureConnectionLocation: response_history.roundtrip?.departureConnectionLocationCode!,
            departureConnectionLocationName: this.getAirportName(
              response_history.roundtrip?.departureConnectionLocationCode!
            ),
            departureConnectionTime: response_history.roundtrip?.departureConnectionTime!,
            departureConnectionTimeHour: this.convertToHoursAndMinutes(
              response_history.roundtrip?.departureConnectionTime!
            ).hour,
            departureConnectionTimeMinutes: this.convertToHoursAndMinutes(
              response_history.roundtrip?.departureConnectionTime!
            ).minute,
            returnConnectionLocation: response_history.roundtrip?.returnConnectionLocationCode!,
            returnConnectionLocationName: this.getAirportName(
              response_history.roundtrip?.returnConnectionLocationCode!
            ),
            returnConnectionTime: response_history.roundtrip?.returnConnectionTime!,
            returnConnectionTimeHour: this.convertToHoursAndMinutes(response_history.roundtrip?.returnConnectionTime!)
              .hour,
            returnConnectionTimeMinutes: this.convertToHoursAndMinutes(
              response_history.roundtrip?.returnConnectionTime!
            ).minute,
            isMultiLine: isMultiLine,
          };
          roundTrip.departureDate = roundTrip.departureDate
            ? this.formatDate(roundTrip.departureDate)
            : roundTrip.departureDate;
          roundTrip.returnDate = roundTrip.returnDate ? this.formatDate(roundTrip.returnDate) : roundTrip.returnDate;
          roundTrip.departureTimeWindowFromName = this.formatTime(
            roundTrip.departureTimeWindowFrom
              ? roundTrip.departureTimeWindowFrom.slice(0, 5)
              : roundTrip.departureTimeWindowFrom
          );

          roundTrip.departureTimeWindowToName = this.formatTime(
            roundTrip.departureTimeWindowTo
              ? roundTrip.departureTimeWindowTo.slice(0, 5)
              : roundTrip.departureTimeWindowTo
          );
          roundTrip.returnTimeWindowFromName = this.formatTime(
            roundTrip.returnTimeWindowFrom ? roundTrip.returnTimeWindowFrom.slice(0, 5) : roundTrip.returnTimeWindowFrom
          );
          roundTrip.returnTimeWindowToName = this.formatTime(
            roundTrip.returnTimeWindowTo ? roundTrip.returnTimeWindowTo.slice(0, 5) : roundTrip.returnTimeWindowTo
          );
        } else {
          roundTripFlag = false;
          if (response_history.bounds) {
            for (const bound_tmp of response_history.bounds) {
              const bound: Bound = {
                originLocationCode: bound_tmp.originLocationCode,
                originLocationName: this.getAirportName(bound_tmp.originLocationCode),
                destinationLocationCode: bound_tmp.destinationLocationCode,
                destinationLocationName: this.getAirportName(bound_tmp.destinationLocationCode),
                departureDate: bound_tmp.departureDate!,
                departureDateUnformatted: bound_tmp.departureDate!,
                departureTimeWindowFrom: bound_tmp.departureTimeWindowFrom!,
                departureTimeWindowTo: bound_tmp.departureTimeWindowTo!,
                departureTimeWindowFromName: '',
                departureTimeWindowToName: '',
              };
              bound.departureDate = bound.departureDate ? this.formatDate(bound.departureDate) : bound.departureDate;
              if (bound.departureTimeWindowFrom) {
                bound.departureTimeWindowFromName = this.formatTime(bound.departureTimeWindowFrom.slice(0, 5));
              }
              if (bound.departureTimeWindowTo) {
                bound.departureTimeWindowToName = this.formatTime(bound.departureTimeWindowTo.slice(0, 5));
              }
              bounds.push(bound);
            }
          }
        }
        //搭乗者の人数表示テキストの生成 言語ごとに区切り文字、テキストの並びが異なるため
        let displayText: string;
        displayText = ';';
        const travelersPropList: {
          key: 'ADT' | 'B15' | 'CHD' | 'INF';
          text: string;
        }[] = [
          { key: 'ADT', text: 'label.selectedAdult' },
          { key: 'B15', text: 'label.selectedYoungAdult' },
          { key: 'CHD', text: 'label.selectedChild' },
          { key: 'INF', text: 'label.selectedInfant' },
        ];
        // 言語設定を基に人数の値、搭乗者の区分の並びを設定する処理が必要
        const displayTextList = [];
        for (const prop of travelersPropList) {
          if (response_history.travelers && prop.key in response_history.travelers) {
            const passengerNumber = response_history.travelers[prop.key];
            if (passengerNumber && passengerNumber > 0) {
              const text = this._staticMsg.transform(prop.text, { '0': passengerNumber.toString() });
              displayTextList.push(text);
            }
          }
        }
        displayText = displayTextList.join(this._staticMsg.transform('label.paxNumberDelimiter') + ' ');
        if (response_history.hasAccompaniedInAnotherReservation !== undefined) {
          let labelKey = response_history.hasAccompaniedInAnotherReservation
            ? 'label.paxAdultsWillAccompanyAnother'
            : 'label.paxUseJuniorPilot';
          displayText += ' ' + this._staticMsg.transform(labelKey);
        }

        const SearchFlightHistory_tmp: SearchFlightHistory = {
          creationDateTime: response_history.creationDateTime!,
          roundTripFlag: roundTripFlag,
          roundTrip: roundTripFlag ? roundTrip : null,
          bounds: !roundTripFlag ? bounds : null,
          fare: {
            isMixedCabin: response_history.fare?.isMixedCabin ?? false,
            cabinClass: response_history.fare?.cabinClass!,
            cabinClassName: response_history.fare?.cabinClass
              ? this.getCabinClassName(response_history.fare.cabinClass, tripDomesticFlg)
              : '',
            fareOptionType: response_history.fare?.fareOptionType!,
            mixedCabinClasses:
              response_history.fare?.isMixedCabin && response_history.fare.mixedCabinClasses
                ? {
                    departureCabinClass: response_history.fare.mixedCabinClasses.departureCabinClass!,
                    departureCabinClassName: response_history.fare.mixedCabinClasses.departureCabinClass
                      ? this.getCabinClassName(
                          response_history.fare.mixedCabinClasses.departureCabinClass,
                          tripDomesticFlg
                        )
                      : '',
                    returnCabinClass: response_history.fare.mixedCabinClasses.returnCabinClass!,
                    returnCabinClassName: response_history.fare.mixedCabinClasses.returnCabinClass
                      ? this.getCabinClassName(
                          response_history.fare.mixedCabinClasses.returnCabinClass,
                          tripDomesticFlg
                        )
                      : '',
                  }
                : {
                    departureCabinClass: '',
                    departureCabinClassName: '',
                    returnCabinClass: '',
                    returnCabinClassName: '',
                  },
          },
          travelers: {
            ADT: response_history.travelers?.ADT!,
            B15: response_history.travelers?.B15!,
            CHD: response_history.travelers?.CHD!,
            INF: response_history.travelers?.INF!,
            displayText: displayText,
          },
          hasAccompaniedInAnotherReservation: response_history.hasAccompaniedInAnotherReservation!,
          promotionCode: '',
          isFavoriteAdded: this.findHistoryInFavorite(response_history, SearchFlightHistory), //this.historyType === "history" ? this.findHistoryinFavorite(response.favorite) : false
        };

        SearchFlightHistoryViewList.push(SearchFlightHistory_tmp);
      }
    }
    return SearchFlightHistoryViewList;
  }

  /**
   * お気に入り登録済検索条件リストの中に履歴と一致するものが存在するかどうかを判定
   * @param history お気に入り追加済を判定する検索履歴
   */
  protected abstract findHistoryInFavorite(history: Items, SearchFlightHistoryState: SearchFlightHistoryState): boolean;

  /** stateから配列1つを抽出する 履歴・お気に入りのどちらかは子クラスで定義する */
  public abstract extractHistoryList(state: SearchFlightHistoryState): Items[];

  /** stateから1つデータを削除したstateを返す */
  public abstract spliceState(state: SearchFlightHistoryState, num: number): SearchFlightHistoryState;

  /**
   * 検索履歴・お気に入りを検索条件に変換する
   * @param SearchFlightHistoryState APIから受け取り保持している結果
   * @param num 変換対象の番号
   */
  public abstract convertHistoryToSearchFlightState(
    SearchFlightHistoryState: SearchFlightHistoryState,
    num: number,
    searchFlightState?: SearchFlightState
  ): SearchFlightState | null;

  /** Time-Only型文字列(HH::mm:ss)⇒分数(mins)の数値に変換　変換不可の場合、デフォルト値を返す
   * @param value:string(HH::mm:ss)
   * @param defaultValue:number
   * @returns number
   */
  protected convertTimeOnlyToMins(value: string | undefined, defaultValue: number): number {
    if (value) {
      const separator = ':';
      const times = value.split(separator);
      if (times.length >= 2) {
        const mins: number = Number(times[0]) * 60 + Number(times[1]);
        return mins;
      } else {
        return defaultValue;
      }
    }
    return defaultValue;
  }
  /** 分数(mins)⇒時間数(Hours),分数(mins)に変換
   * @param value:any(mins)
   * @returns hour 処理に失敗の場合0を返す
   * @returns minute 処理に失敗の場合0を返す
   */
  private convertToHoursAndMinutes(value: number): { hour: number; minute: number } {
    //  処理に失敗の場合0を返す
    if (value < 0 || value === null || value === undefined) {
      return { hour: 0, minute: 0 };
    }
    let hour = Math.floor(value / 60);
    let minute = value % 60;
    return { hour, minute };
  }

  /**
   * 履歴・お気に入りのキャビン表記を検索条件用に変換するためのマップ
   * @param value
   * @returns string:変換後の文字列、null:変換失敗
   */
  protected convertApiCabinIdToSelectId(value: string): string | null {
    if (value !== '') {
      if (value in this.CABIN_CLASS_CONVERT_MAP) {
        return this.CABIN_CLASS_CONVERT_MAP[value];
      } else {
        return null;
      }
    } else {
      return null;
    }
  }
}

/**
 * 検索履歴モーダルの処理
 */
class HistoryMethod extends SearchFlightHistorySelectMethod {
  constructor(
    _staticMsg: StaticMsgPipe,
    _dateFormatPipe: DateFormatPipe,
    cabinListCache: any,
    shoppingLibService: ShoppingLibService
  ) {
    super(_staticMsg, _dateFormatPipe, cabinListCache, shoppingLibService);
  }

  public extractHistoryList(state: SearchFlightHistoryState): Items[] {
    return state.histories!;
  }

  protected findHistoryInFavorite(history: Items, SearchFlightHistoryState: SearchFlightHistoryState): boolean {
    const favorite: Items[] = SearchFlightHistoryState.favorite!;

    let favorite_filtered: Items[] = favorite.filter((v) => v.tripType === history.tripType);
    if (favorite_filtered.length === 0) {
      return false;
    } else if (history.tripType === 'roundtrip') {
      favorite_filtered = favorite_filtered.filter(
        (v) => v.roundtrip?.originLocationCode === history.roundtrip?.originLocationCode
      );
      favorite_filtered = favorite_filtered.filter(
        (v) => v.roundtrip?.destinationLocationCode === history.roundtrip?.destinationLocationCode
      );
      favorite_filtered = favorite_filtered.filter(
        (v) => v.roundtrip?.departureTimeWindowFrom === history.roundtrip?.departureTimeWindowFrom
      );
      favorite_filtered = favorite_filtered.filter(
        (v) => v.roundtrip?.departureTimeWindowTo === history.roundtrip?.departureTimeWindowTo
      );
      favorite_filtered = favorite_filtered.filter(
        (v) => v.roundtrip?.returnTimeWindowFrom === history.roundtrip?.returnTimeWindowFrom
      );
      favorite_filtered = favorite_filtered.filter(
        (v) => v.roundtrip?.returnTimeWindowTo === history.roundtrip?.returnTimeWindowTo
      );
      favorite_filtered = favorite_filtered.filter(
        (v) => v.roundtrip?.departureConnectionLocationCode === history.roundtrip?.departureConnectionLocationCode
      );
      favorite_filtered = favorite_filtered.filter(
        (v) => v.roundtrip?.departureConnectionTime === history.roundtrip?.departureConnectionTime
      );
      favorite_filtered = favorite_filtered.filter(
        (v) => v.roundtrip?.returnConnectionLocationCode === history.roundtrip?.returnConnectionLocationCode
      );
      favorite_filtered = favorite_filtered.filter(
        (v) => v.roundtrip?.returnConnectionTime === history.roundtrip?.returnConnectionTime
      );
      if (favorite_filtered.length === 0) {
        return false;
      }
    } else {
      favorite_filtered = favorite_filtered.filter((v) => v.bounds?.length === history.bounds?.length);
      //配列のfilterメソッドで、値が一致する要素のみ抽出する
      favorite_filtered = favorite_filtered.filter((v) => {
        if (history.bounds && v.bounds) {
          for (let i = 0; i < history.bounds.length; i++) {
            if (
              v.bounds[i].originLocationCode !== history.bounds[i].originLocationCode ||
              v.bounds[i].destinationLocationCode !== history.bounds[i].destinationLocationCode ||
              v.bounds[i].departureTimeWindowFrom !== history.bounds[i].departureTimeWindowFrom ||
              v.bounds[i].departureTimeWindowTo !== history.bounds[i].departureTimeWindowTo
            ) {
              //filterメソッドの戻り値 ひとつでも一致しないバウンドがある場合false
              return false;
            }
          }
        }
        //filterメソッドの戻り値 全バウンドが一致でtrue
        return true;
      });
      if (favorite_filtered.length === 0) {
        return false;
      }
    }

    // 当該履歴.fare配下と当該お気に入り.fare配下の以下の項目が全て一致する
    favorite_filtered = favorite_filtered.filter(
      (v) =>
        v.fare?.isMixedCabin === history.fare?.isMixedCabin &&
        v.fare?.cabinClass === history.fare?.cabinClass &&
        v.fare?.fareOptionType === history.fare?.fareOptionType &&
        v.fare?.mixedCabinClasses?.departureCabinClass === history.fare?.mixedCabinClasses?.departureCabinClass &&
        v.fare?.mixedCabinClasses?.returnCabinClass === history.fare?.mixedCabinClasses?.returnCabinClass
    );
    if (favorite_filtered.length === 0) {
      return false;
    }

    // 当該履歴.travelers配下と当該お気に入り.travelers配下の以下の項目が全て一致する
    favorite_filtered = favorite_filtered.filter(
      (v) =>
        v.travelers?.ADT === history.travelers?.ADT &&
        v.travelers?.CHD === history.travelers?.CHD &&
        v.travelers?.INF === history.travelers?.INF &&
        v.hasAccompaniedInAnotherReservation === history.hasAccompaniedInAnotherReservation
    );
    if (favorite_filtered.length === 0) {
      return false;
    }
    return true;
  }

  public spliceState(state: SearchFlightHistoryState, num: number): SearchFlightHistoryState {
    const arrayState = state.histories!.concat();
    arrayState.splice(num, 1);
    const returnState: SearchFlightHistoryState = {
      ...state,
      histories: arrayState,
    };
    return returnState;
  }

  // 履歴
  public convertHistoryToSearchFlightState(
    SearchFlightHistoryState: SearchFlightHistoryState,
    num: number
  ): SearchFlightState | null {
    let history: Items;
    if ('histories' in SearchFlightHistoryState) {
      history = SearchFlightHistoryState.histories![num];
    } else {
      return null;
    }
    let roundTrip: newRoundTrip = <newRoundTrip>{};
    const onewayOrMultiCity: OnewayBounds[] = [];
    let tripType: TripType;
    tripType = TripType.ROUND_TRIP;
    if (history.tripType === 'roundtrip') {
      tripType = TripType.ROUND_TRIP;
      roundTrip = {
        ...searchFlightInitialState.roundTrip,
        departureOriginLocationCode: history.roundtrip?.originLocationCode!,
        departureDestinationLocationCode: history.roundtrip?.destinationLocationCode!,
        departureDate: this.parseToDate(history.roundtrip?.departureDate),
        //出発時間帯は時間単位で渡すため、変換
        departureTimeWindowFrom: this.convertTimeOnlyToMins(
          history.roundtrip?.departureTimeWindowFrom,
          SearchFlightConstant.TIME_WINDOW_MIN
        ),
        departureTimeWindowTo: this.convertTimeOnlyToMins(
          history.roundtrip?.departureTimeWindowTo,
          SearchFlightConstant.TIME_WINDOW_MAX
        ),
        returnOriginLocationCode: history.roundtrip?.destinationLocationCode!,
        returnDestinationLocationCode: history.roundtrip?.originLocationCode!,
        returnDate: this.parseToDate(history.roundtrip?.returnDate),
        returnTimeWindowFrom: this.convertTimeOnlyToMins(
          history.roundtrip?.returnTimeWindowFrom,
          SearchFlightConstant.TIME_WINDOW_MIN
        ),
        returnTimeWindowTo: this.convertTimeOnlyToMins(
          history.roundtrip?.returnTimeWindowTo,
          SearchFlightConstant.TIME_WINDOW_MAX
        ),
        departureConnection: {
          connectionLocationCode: history.roundtrip?.departureConnectionLocationCode!,
          connectionTime: history.roundtrip?.departureConnectionTime!,
        },
        returnConnection: {
          connectionLocationCode: history.roundtrip?.returnConnectionLocationCode!,
          connectionTime: history.roundtrip?.returnConnectionTime!,
        },
      };
    } else if (history.tripType === 'onewayOrMulticity') {
      tripType = TripType.ONEWAY_OR_MULTI_CITY;
      roundTrip = {
        ...searchFlightInitialState.roundTrip,
      };
      if (history.bounds && history.bounds.length > 0) {
        for (const bound of history.bounds) {
          onewayOrMultiCity.push({
            // 空港コードに「+」が付与されている場合、「+」は削除する。
            originLocationCode: bound.originLocationCode.replace(/\+/g, ''),
            destinationLocationCode: bound.destinationLocationCode.replace(/\+/g, ''),
            connectionLocationCode: null,
            departureDate: this.parseToDate(bound.departureDate),
            departureTimeWindowFrom: this.convertTimeOnlyToMins(
              bound.departureTimeWindowFrom,
              SearchFlightConstant.TIME_WINDOW_MIN
            ),
            departureTimeWindowTo: this.convertTimeOnlyToMins(
              bound.departureTimeWindowTo,
              SearchFlightConstant.TIME_WINDOW_MAX
            ),
          });
        }
      }
    } else {
      return null;
    }
    const state: SearchFlightState = {
      ...searchFlightInitialState,
      tripType: tripType,
      roundTrip: roundTrip,
      onewayOrMultiCity: onewayOrMultiCity,
      traveler: {
        adt: history.travelers?.ADT!,
        b15: history.travelers?.B15!,
        chd: history.travelers?.CHD!,
        inf: history.travelers?.INF!,
      },
      hasAccompaniedInAnotherReservation: history.hasAccompaniedInAnotherReservation ?? null,
      fare: {
        isMixedCabin: history.fare?.isMixedCabin ?? false,
        cabinClass: history.fare?.isMixedCabin
          ? history.fare?.mixedCabinClasses?.departureCabinClass!
          : history.fare?.cabinClass!,
        fareOptionType: history.fare?.fareOptionType ?? '',
        returnCabinClass: history.fare?.isMixedCabin ? history.fare.mixedCabinClasses?.returnCabinClass! : '',
      },
      promotion: {
        code: '',
      },
      searchPreferences: {
        getAirCalendarOnly: false,
        getLatestOperation: false,
      },
      lowestPrice: {
        displayedTotalPrice: null,
        displayedBasePrice: null,
        displayedCurrency: null,
      },
    };
    return state;
  }
}

/**
 * お気に入りモーダルの処理
 */
class FavoriteMethod extends SearchFlightHistorySelectMethod {
  constructor(
    _staticMsg: StaticMsgPipe,
    _dateFormatPipe: DateFormatPipe,
    cabinListCache: any,
    shoppingLibService: ShoppingLibService
  ) {
    super(_staticMsg, _dateFormatPipe, cabinListCache, shoppingLibService);
  }
  public extractHistoryList(state: SearchFlightHistoryState): Items[] {
    return state.favorite!;
  }

  protected findHistoryInFavorite(history: Items, SearchFlightHistoryState: SearchFlightHistoryState): boolean {
    return false;
  }

  public spliceState(state: SearchFlightHistoryState, num: number): SearchFlightHistoryState {
    const arrayState = state.favorite!.concat();
    arrayState.splice(num, 1);
    const returnState: SearchFlightHistoryState = {
      ...state,
      favorite: arrayState,
    };
    return returnState;
  }

  // お気に入り
  public convertHistoryToSearchFlightState(
    SearchFlightHistoryState: SearchFlightHistoryState,
    num: number,
    searchFlightState: SearchFlightState
  ): SearchFlightState | null {
    let history: Items;
    if ('favorite' in SearchFlightHistoryState) {
      history = SearchFlightHistoryState.favorite![num];
    } else {
      return null;
    }
    let roundTrip: newRoundTrip = <newRoundTrip>{};
    const onewayOrMultiCity: OnewayBounds[] = [];
    let tripType: TripType;
    tripType = TripType.ROUND_TRIP;
    if (history.tripType === 'roundtrip') {
      tripType = TripType.ROUND_TRIP;
      roundTrip = {
        ...searchFlightInitialState.roundTrip,
        // 空港コードに「+」が付与されている場合、「+」は削除する。
        departureOriginLocationCode: history.roundtrip?.originLocationCode!.replace(/\+/g, '')!,
        departureDestinationLocationCode: history.roundtrip?.destinationLocationCode!.replace(/\+/g, '')!,
        // 保持している検索条件から出発日を除いてクリアする。
        departureDate:
          searchFlightState.tripType === TripType.ROUND_TRIP ? searchFlightState.roundTrip.departureDate : null,
        departureTimeWindowFrom: this.convertTimeOnlyToMins(
          history.roundtrip?.departureTimeWindowFrom,
          SearchFlightConstant.TIME_WINDOW_MIN
        ),
        departureTimeWindowTo: this.convertTimeOnlyToMins(
          history.roundtrip?.departureTimeWindowTo,
          SearchFlightConstant.TIME_WINDOW_MAX
        ),
        returnOriginLocationCode: history.roundtrip?.destinationLocationCode!,
        returnDestinationLocationCode: history.roundtrip?.originLocationCode!,
        // 保持している検索条件から出発日を除いてクリアする。
        returnDate: searchFlightState.tripType === TripType.ROUND_TRIP ? searchFlightState.roundTrip.returnDate : null,
        returnTimeWindowFrom: this.convertTimeOnlyToMins(
          history.roundtrip?.returnTimeWindowFrom,
          SearchFlightConstant.TIME_WINDOW_MIN
        ),
        returnTimeWindowTo: this.convertTimeOnlyToMins(
          history.roundtrip?.returnTimeWindowTo,
          SearchFlightConstant.TIME_WINDOW_MAX
        ),
        departureConnection: {
          connectionLocationCode: history.roundtrip?.departureConnectionLocationCode!,
          connectionTime: history.roundtrip?.departureConnectionTime!,
        },
        returnConnection: {
          connectionLocationCode: history.roundtrip?.returnConnectionLocationCode!,
          connectionTime: history.roundtrip?.returnConnectionTime!,
        },
      };
    } else if (history.tripType === 'onewayOrMulticity') {
      tripType = TripType.ONEWAY_OR_MULTI_CITY;
      roundTrip = {
        ...searchFlightInitialState.roundTrip,
      };
      if (history.bounds && history.bounds.length > 0) {
        for (let i = 0; i < history.bounds.length; i++) {
          const bound = history.bounds[i];
          let departDateOld = null;
          // 保持している検索条件から出発日を除いてクリアする。
          if (
            searchFlightState.tripType === TripType.ONEWAY_OR_MULTI_CITY &&
            searchFlightState.onewayOrMultiCity.length > i
          ) {
            departDateOld = searchFlightState.onewayOrMultiCity[i].departureDate;
          }
          onewayOrMultiCity.push({
            originLocationCode: bound.originLocationCode,
            destinationLocationCode: bound.destinationLocationCode,
            connectionLocationCode: null,
            departureDate: departDateOld,
            departureTimeWindowFrom: this.convertTimeOnlyToMins(
              bound.departureTimeWindowFrom,
              SearchFlightConstant.TIME_WINDOW_MIN
            ),
            departureTimeWindowTo: this.convertTimeOnlyToMins(
              bound.departureTimeWindowTo,
              SearchFlightConstant.TIME_WINDOW_MAX
            ),
          });
        }
      }
    } else {
      return null;
    }
    const state: SearchFlightState = {
      ...searchFlightInitialState,
      tripType: tripType,
      roundTrip: roundTrip,
      onewayOrMultiCity: onewayOrMultiCity,
      traveler: {
        adt: history.travelers?.ADT!,
        b15: history.travelers?.B15!,
        chd: history.travelers?.CHD!,
        inf: history.travelers?.INF!,
      },
      hasAccompaniedInAnotherReservation: history.hasAccompaniedInAnotherReservation ?? null,
      fare: {
        isMixedCabin: history.fare?.isMixedCabin ?? false,
        cabinClass: history.fare?.isMixedCabin
          ? history.fare?.mixedCabinClasses?.departureCabinClass!
          : history.fare?.cabinClass!,
        fareOptionType: history.fare?.fareOptionType ?? '0',
        returnCabinClass: history.fare?.isMixedCabin ? history.fare.mixedCabinClasses?.returnCabinClass! : '',
      },
      promotion: {
        code: '',
      },
      searchPreferences: {
        getAirCalendarOnly: false,
        getLatestOperation: false,
      },
      lowestPrice: {
        displayedTotalPrice: null,
        displayedBasePrice: null,
        displayedCurrency: null,
      },
    };
    return state;
  }
}
