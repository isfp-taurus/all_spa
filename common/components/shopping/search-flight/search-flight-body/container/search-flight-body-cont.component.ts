import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { Inject, LOCALE_ID } from '@angular/core';
import {
  SearchFlightState,
  TripType,
  Bound,
  searchFlightInitialState,
  SearchFlightConstant,
} from '@common/store/search-flight';
import { APF_OFFICE_CODE } from '@common/interfaces';
import { CommonLibService } from '@lib/services/common-lib/common-lib.service';
import { SearchFlightBodyPresProps } from '../presenter/search-flight-body-pres.state';
import {
  AlertMessageItem,
  Airport,
  ErrorType,
  PageType,
  SessionStorageName,
  ValidationErrorInfo,
  AnaBizLoginStatusType,
} from '@lib/interfaces';
import { SupportComponent } from '@lib/components/support-class';
import { SearchFlightStoreService } from '@common/services/store/search-flight/search-flight-store/search-flight-store.service';
import { SearchFlightConditionForRequestService } from '@common/services/store/search-flight/search-flight-condition-for-request-store/search-flight-condition-for-request-store.service';
import { SearchFlightConditionForRequestState } from '@common/store/search-flight-condition-for-request';
import { RoundtripOwdRequestItinerariesInner } from 'src/sdk-search/model/roundtripOwdRequestItinerariesInner';
import {
  AswContextStoreService,
  ErrorsHandlerService,
  GetMemberInformationStoreService,
  PageLoadingService,
  SystemDateService,
} from '@lib/services';
import { TerminalType } from '@lib/components/shared-ui-components/airport/airport.state';
import { ShoppingLibService } from '@common/services/shopping/shopping-lib/shopping-lib.service';
import { CurrentCartStoreService, LocalDateService } from '@common/services';
import { combineLatest, Subscription, map, of, Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { StaticMsgPipe } from '@lib/pipes';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { RoutesResRoutes } from '@conf/routes.config';
import { AswMasterService } from '@lib/services/asw-master/asw-master.service';
import {
  BoundToMerge,
  RoundTrip,
  onewayOrMulticity,
  inputData,
  BookingTypeAwardOptionTypeEnum,
  defaultSearchFlightDynamicParams,
  SearchFlightDynamicParams,
  dynamicSubject,
} from '@common/components/shopping/search-flight/search-flight-body/container/search-flight-body-cont.state';
import { PageInitService } from '@lib/services/page-init/page-init.service';
import {
  AirportI18nSearchForAirportCode,
  AllOffice,
  CabinClassOptionList,
} from '@common/services/shopping/shopping-lib/shopping-lib.state';
import { SearchFlightBodyPresComponent } from '../presenter/search-flight-body-pres.component';
import { FareTypeSelectorModalService } from '@common/components/shopping/search-flight/fare-type-selector/fare-type-selector-modal.service';
import { DeliverySearchInformationStoreService } from '@common/services/store/delivery-search-information-store/delivery-search-information-store.service';
import {
  MaxPassengersCount,
  OldDomesticAswMaxPassengersCount,
} from '../../passenger-selector/passenger-selector.state';
import { MasterStoreKey, MASTER_TABLE } from '@conf/asw-master.config';
import { OtherBookingPassengerModalService } from '../../other-booking-passenger/other-booking-passenger-modal.service';
import { CaptchaAuthenticationStatusGetStoreService } from '@common/services/captcha-authentication-status-get/captcha-authentication-status-get-store.service';
import { AppConstants } from '@conf/app.constants';

@Component({
  selector: 'asw-search-flight-body-cont',
  templateUrl: './search-flight-body-cont.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchFlightBodyContComponent extends SupportComponent implements AfterViewInit {
  //定数定義
  /** バウンド数最大値 */
  readonly MAX_BOUND_LIST_LENGTH = SearchFlightConstant.MAX_ONEWAY_OR_MULTICITY_BOUNDS_LENGTH;

  //プロパティ定義
  //Storeで管理するステートの定義
  /** フライト検索画面 Storeに格納する検索条件State */
  public searchFlightData!: SearchFlightState;

  /** タブの選択状態 */
  public tabIndex: number;
  /** 国際判断フラグ */
  public isJapanOnlyFlag: boolean;
  /** 操作オフィスの下2桁 */
  public suffixCode: string = '';
  /** 空港情報（IATAコード取得用） */
  public AirportI18n_SearchForAirportCode: { [key: string]: AirportI18nSearchForAirportCode[] } = {};
  /** 全オフィスリスト */
  public allOffice: AllOffice[] = [];
  /** ユーザ共通情報（AswContext）に保存された操作オフィスコード */
  public pointOfSaleId: string = '';
  /** 操作オフィス地域コード */
  public officeRegionCode: string = '';
  /** 区間オプション表示 */
  public isOpenSearchOption: boolean = false;

  //サブコンポーネントへのinput定義
  /** presenterに渡すパラメータ */
  public searchFlightPresProps!: SearchFlightBodyPresProps;

  /** 出発地のラベル */
  public departureAirportLabel = 'label.departureLocation';
  /** 到着地のラベル */
  public destinationAirportLabel = 'label.arrivalLocation';
  /** 乗継地のラベル */
  public transitAirportLabel = 'label.transferconditionAir';
  /** キャシュー成功判定 */
  public cacheLoadingCompleted: boolean = false;

  @Input()
  public information: {
    departureOriginLocationCode: string | ValidationErrorInfo;
    departureDestinationLocationCode: string | ValidationErrorInfo;
    passengersErrorMsg: string | ValidationErrorInfo;
    originBoundErrorMsg: string | ValidationErrorInfo;
  } = {
    //往復
    departureOriginLocationCode: '',
    departureDestinationLocationCode: '',
    //エラーメッセージ用
    passengersErrorMsg: '',
    originBoundErrorMsg: '',
  };
  @Input() onewayInformationList: Array<number> = [];
  @Output()
  changeOptionOpenEvent = new EventEmitter<boolean>();

  //当画面のState定義
  /** 前回の日本国内単独旅程判定結果 */
  private _prevJapanOnlyTrip = false;

  private errorMessageForRequestParamMap: Map<string, string | ValidationErrorInfo> = new Map();

  /** DCS移行開始日前後状態 */
  public dcsMigrationDateStatus: string = '';
  /** 旧国内ASW取扱検索条件フラグ */
  public oldDomesticAswSearchFlag: boolean = false;
  /** 前回のDCS移行開始日前後状態 */
  private _prevDcsMigrationDateStatus = '';
  private _subscription: Subscription = new Subscription();
  /** 自動検索要否 */
  public autoSearch: boolean = false;
  // 流入パラメータ
  public requestParam: any;

  public appConstants = AppConstants;
  /** コンストラクタ */
  constructor(
    protected _common: CommonLibService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _searchFlightStoreService: SearchFlightStoreService,
    private _searchFlightConditionForRequestService: SearchFlightConditionForRequestService,
    private _currentCartStoreService: CurrentCartStoreService,
    private _systemDateSvc: SystemDateService,
    private _shoppingLibService: ShoppingLibService,
    private _staticMsg: StaticMsgPipe,
    private _router: Router,
    private _aswMasterSvc: AswMasterService,
    private _aswContextStoreSvc: AswContextStoreService,
    private _errorsHandlerSvc: ErrorsHandlerService,
    private _pageInit: PageInitService,
    private _getMemberInformationService: GetMemberInformationStoreService,
    private _datePipe: DatePipe,
    private _fareTypeSelectorModalService: FareTypeSelectorModalService,
    private _deliverySearchInformationStoreService: DeliverySearchInformationStoreService,
    private _localDateService: LocalDateService,
    private _captchaAuthenticationStoreSvc: CaptchaAuthenticationStatusGetStoreService,
    private _loadingSvc: PageLoadingService,
    private _otherBookingPassengerModalService: OtherBookingPassengerModalService,
    @Inject(LOCALE_ID) private _localeId: string
  ) {
    super(_common);
    //セッションストレージの開始とロード
    this._searchFlightStoreService.startSessionStorage();
    this.searchFlightData = this._searchFlightStoreService.getData();

    //サブスクリプションを追加する
    this.subscribeService('SearchFlightStoreService', this._searchFlightStoreService.searchFlight$, (data) => {
      this.searchFlightData = data;
      this.tabIndex = this.searchFlightData.tripType === TripType.ONEWAY_OR_MULTI_CITY ? 1 : 0;
      const posCountryCode = this._aswContextStoreSvc.aswContextData.posCountryCode;
      this.oldDomesticAswSearchFlag = this._shoppingLibService.getOldDomesticAswSearchFlag(data, posCountryCode);
    });

    //画面状態の初期設定
    this.tabIndex = 0;
    this.isJapanOnlyFlag = true;

    //表示言語の出発地のラベルを設定
    this.subscribeService('getStaticMessage', this._staticMsg.get('label.departureLocation'), (str) => {
      this.departureAirportLabel = str;
    });

    //表示言語の到着地のラベルを設定
    this.subscribeService('getStaticMessage', this._staticMsg.get('label.arrivalLocation'), (str) => {
      this.destinationAirportLabel = str;
    });

    //表示言語の乗継地のラベルを設定
    this.subscribeService('getStaticMessage', this._staticMsg.get('label.transferconditionAir'), (str) => {
      this.transitAirportLabel = str;
    });

    const otherPassengerInfo = this._otherBookingPassengerModalService.getBookingPassengerInfo();
    this.subscribeService('otherPassengerInfoCheck', otherPassengerInfo, (data) => {
      if (data) {
        const state: SearchFlightState = {
          ...this.searchFlightData,
          // 保持している検索条件.別予約同行者情報
          // 別予約同行者有無に値なしを設定する。
          hasAccompaniedInAnotherReservation: data.isOtherBookingPassenger,
        };
        this._searchFlightStoreService.updateStore(state);
        this._errorsHandlerSvc.clearRetryableError(PageType.PAGE);
      }
    });
  }

  /** INTERNAL_DESIGN_EVENT 初期表示処理 */
  init() {
    // 画面の初期化処理(G01-003)の初期化開始処理を呼び出す。
    this._pageInit.startInit();
    //キャッシュデータロード時のデータ取得処理を定義
    //必要なキャッシュをすべて取得できたら処理を実施 フォークジョインの場合completeしないと通知がないためこの記載で対応
    this.subscribeService(
      'getCash',
      this._aswMasterSvc.load(
        [
          MASTER_TABLE.DEPARTURE_AIRPORT_ALL,
          MASTER_TABLE.DESTINATION_AIRPORT_ALL,
          MASTER_TABLE.REGION_ALL,
          MASTER_TABLE.REGION_JAPAN,
          MASTER_TABLE.DEPARTURE_AIRPORT_EXCEPT_CUBA,
          MASTER_TABLE.DEPARTURE_AIRPORT_JAPAN,
          MASTER_TABLE.DESTINATION_AIRPORT_JAPAN,
          MASTER_TABLE.DESTINATION_AIRPORT_EXCEPT_CUBA,
          MASTER_TABLE.REGION_ABROAD,
          MASTER_TABLE.DESTINATION_AIRPORT_ABROAD,
          MASTER_TABLE.M_LIST_DATA_930,
          MASTER_TABLE.M_LIST_DATA_940,
          MASTER_TABLE.AIRPORT_I18N_SEARCH_FOR_AIRPORT_CODE,
          MASTER_TABLE.M_LIST_DATA_931,
        ],
        true
      ),
      (data) => {
        this.deleteSubscription('getCash');
        // 各子コンポーネントを起動する
        this.cacheLoadingCompleted = true;
        // 空港情報（IATAコード取得用
        this.AirportI18n_SearchForAirportCode =
          this._aswMasterSvc.aswMaster[MasterStoreKey.AirportI18n_SearchForAirportCode];
        // 全オフィスリスト
        this.allOffice = this._aswMasterSvc.aswMaster[MasterStoreKey.OFFICE_ALL];

        // プロモーションコードの利用が可能なオフィスであるか判定
        this.pointOfSaleId = this._common.aswContextStoreService.aswContextData.pointOfSaleId;
        const displayOffice = this.allOffice.find((off) => off.office_code === this.pointOfSaleId);
        this.officeRegionCode = displayOffice?.initial_region_code ?? '';

        // 他画面からエラーを設定する場合、画面上に表示する
        const errorInfo = this._deliverySearchInformationStoreService.GetAndReSetDeliverySearchInformation();
        if (errorInfo !== undefined) {
          this._errorsHandlerSvc.setRetryableError(PageType.PAGE, errorInfo);
        }

        //子コンポーネントに渡す値の設定
        this.tabIndex = this.searchFlightData.tripType === TripType.ONEWAY_OR_MULTI_CITY ? 1 : 0;
        // 外部流入値の取得
        if (this.fetchRequestParam()) {
          // ローディング画面表示終了
          this._loadingSvc.endLoading();
          // 検索処理成功の場合、画面遷移する
          this._captchaAuthenticationStoreSvc.skipCaptchaHandle();
          return;
        }

        /**エラーマップが０ではない場合、エラーを画面に設定する*/
        if (this.errorMessageForRequestParamMap.size > 0) {
          this.setErrorMessage(this.errorMessageForRequestParamMap);
        }

        // プラン削除フラグ
        const deletedFlag = this.readAndClearStorageFlag();
        // パラメータのプラン削除をTRUEに設定する
        const params: SearchFlightDynamicParams = defaultSearchFlightDynamicParams();
        params.planDeleted = deletedFlag;
        // 削除フラグをプッシュし、jsに動かせる
        dynamicSubject.next(params);

        // ログイン済みの場合
        if (!this._common.isNotLogin()) {
          // 会員情報取得
          const memberInformation$ = this._common.amcMemberStoreService.saveMemberInformationToAMCMember$();
          // 削除フラグと会員情報を合併する
          this._subscription.add(
            memberInformation$
              .pipe(
                take(1),
                map((memberInformation) => {
                  // dynamicSubjectの情報取得
                  const pageContext = dynamicSubject.getValue();
                  return {
                    ...pageContext,
                    getMemberInformationReply: memberInformation,
                  };
                })
              )
              .subscribe((dynamicParams) => {
                dynamicSubject.next(dynamicParams);
              })
          );
        }
        // 最後統一で動的文言ObservableをPageInitに注入
        const dynamicParams$ = dynamicSubject.asObservable();
        this._pageInit.endInit(dynamicParams$);

        this.searchFlightPresProps = {
          // 空港選択部品
          airportListParts: {
            terminalType: TerminalType.NONE,
          },
          airportListPartsFrom: {
            terminalType: TerminalType.DEPARTURE,
            inputLabel: this.departureAirportLabel,
          },
          airportListPartsTo: {
            terminalType: TerminalType.DESTINATION,
            inputLabel: this.destinationAirportLabel,
          },
          airportListPartsTransit: {
            terminalType: TerminalType.DESTINATION,
            inputLabel: this.transitAirportLabel,
          },
          isOpenSearchOption: this.isOpenSearchOption,
        };
        this._changeDetectorRef.detectChanges();
        this.showErrorMsg(this.errorMessageForRequestParamMap);
      }
    );

    //セッションストレージからaswServiceを削除する
    sessionStorage.removeItem('aswService');
  }

  /** 画面終了時処理 */
  destroy() {
    this._subscription.unsubscribe();
  }

  /** 画面更新時処理 */
  reload() {}

  ngAfterViewInit(): void {
    /** 子コンポーネントにプロパティを渡したあと再描画する */
    this._changeDetectorRef.markForCheck();
  }

  public showErrorMsg(errorMessageForRequestParamMap: Map<string, string | ValidationErrorInfo>): void {
    /**エラーマップが０ではない場合、エラーを画面に設定する*/
    if (errorMessageForRequestParamMap.size > 0) {
      // 往復の場合
      if (this.searchFlightData.tripType === TripType.ROUND_TRIP) {
        errorMessageForRequestParamMap.forEach((error, key) => {
          let msg;
          if (typeof error === 'string') {
            msg = {
              errorMsgId: error,
            };
          } else {
            msg = { 'validate-flight': error as ValidationErrorInfo };
          }
          if (key === 'departureDate' || key === 'returnDate') {
            this.searchFlightBodyPresComponent!.roundTripComponent.roundFormGroup.get('departureAndReturnDate')
              ?.get(key)
              ?.markAsTouched();
            this.searchFlightBodyPresComponent!.roundTripComponent.roundFormGroup.get('departureAndReturnDate')
              ?.get(key)
              ?.setErrors(msg);
            this.searchFlightBodyPresComponent!.roundTripComponent.departureAndReturnDateComponent.markTouched();
          } else {
            this.searchFlightBodyPresComponent!.roundTripComponent.roundFormGroup.get(key)?.markAsTouched();
            this.searchFlightBodyPresComponent!.roundTripComponent.roundFormGroup.get(key)?.setErrors(msg);
          }
        });
      } else {
        // 複雑の場合
        const fGrp = this.searchFlightBodyPresComponent!.onewayOrMulticityComponent.getFormControlGroup();
        errorMessageForRequestParamMap.forEach((error, key) => {
          let msg;
          if (typeof error === 'string') {
            msg = {
              errorMsgId: error,
            };
          } else {
            msg = { 'validate-flight': error as ValidationErrorInfo };
          }
          fGrp.get(key)?.markAsTouched();
          fGrp.get(key)?.setErrors(msg);
          if (key.startsWith('departureDate')) {
            this.searchFlightBodyPresComponent!.onewayOrMulticityComponent.departureDateComponent.get(
              Number(key.at(key.length - 1))
            )?.markTouched();
          }
        });
      }
    }
  }

  /** yyyy-mm-dd形式からDate型に変換 */
  private convertStringToDate(dataString: string) {
    const dateParts = dataString.split('-');
    if (dateParts.length === 3) {
      const year = parseInt(dateParts[0], 10);
      const month = parseInt(dateParts[1], 10) - 1;
      const day = parseInt(dateParts[2], 10);
      if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
        return new Date(year, month, day);
      }
    }
    return null;
  }

  /** yyyy-mm-dd形式をチェックする */
  public judgeStringDate(dateString: string) {
    const reg = /^\d{4}(-\d{2}){2}$/;
    return reg.test(dateString);
  }

  /** INTERNAL_DESIGN_EVENT 旅程種別タブ押下時処理 */
  getActiveTabNumber(event: number) {
    // FIXME:暫定対応 往復旅程から複雑旅程に切り替える部分のローディング開始処理
    this._loadingSvc.startLoading();
    if (event === 1) {
      // FIXME:暫定対応 画面のローディングを先に反映させるためにsetTimeoutで別スレッドで動作させる。
      setTimeout(() => {
        this.replaceStateRoundtripToOneWayOrMulticity();
      }, 500);
    } else {
      // FIXME:暫定対応 画面のローディングを先に反映させるためにsetTimeoutで別スレッドで動作させる。
      setTimeout(() => {
        this.replaceStateOneWayOrMulticityToRoundtrip();
      }, 500);
    }
  }

  /** Dateオブジェクトを日付文字列のフォーマットへ変換する yyyy-MM-dd */
  private convertDateToFormatDateString(date: Date | null): string {
    if (date != null) {
      if (typeof date === 'string') {
        date = new Date(date);
      }
      return (
        date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2)
      );
    } else {
      return '';
    }
  }

  /** Dateオブジェクトを日付文字列のフォーマットへ変換する yyyyMMdd */
  private convertDateToFormatDateStringNoHyphen(date: Date | null): string {
    if (date != null) {
      return date.getFullYear() + ('0' + (date.getMonth() + 1)).slice(-2) + ('0' + date.getDate()).slice(-2);
    } else {
      return '';
    }
  }

  /** HH:mm:ss形式に変換する */
  private formatDepartureTimeForAPI(value: number) {
    return new Date(value * 60 * 1000).toISOString().substring(11, 19);
  }

  /** 検索条件の状態を往復旅程から複雑旅程に置き換える */
  public replaceStateRoundtripToOneWayOrMulticity() {
    if (this.searchFlightData.tripType === TripType.ROUND_TRIP) {
      // ユーザ共通.POS国コードを取得する
      const posCountryCode = this._aswContextStoreSvc.aswContextData.posCountryCode;
      const multicityBounds: Array<Bound> = [];
      // エラーをクリアする
      this.searchFlightBodyPresComponent?.onewayOrMulticityComponent.boundInit();

      /** 往路情報を置き換え */
      multicityBounds.push({
        originLocationCode: this.searchFlightData.roundTrip.departureOriginLocationCode,
        destinationLocationCode:
          this.searchFlightData.roundTrip.departureConnection.connectionLocationCode && !this.oldDomesticAswSearchFlag
            ? this.searchFlightData.roundTrip.departureConnection.connectionLocationCode
            : this.searchFlightData.roundTrip.departureDestinationLocationCode,
        connectionLocationCode: null,
        departureDate: this.searchFlightData.roundTrip.departureDate,
        departureTimeWindowFrom: this.searchFlightData.roundTrip.departureTimeWindowFrom,
        departureTimeWindowTo: this.searchFlightData.roundTrip.departureTimeWindowTo,
      });

      /** 往路乗継地が存在する場合置き換え */
      if (
        this.searchFlightData.roundTrip.departureConnection.connectionLocationCode &&
        !this.oldDomesticAswSearchFlag
      ) {
        multicityBounds.push({
          originLocationCode: this.searchFlightData.roundTrip.departureConnection.connectionLocationCode,
          destinationLocationCode: this.searchFlightData.roundTrip.departureDestinationLocationCode,
          connectionLocationCode: null,
          departureDate: this.searchFlightData.roundTrip.departureDate,
          departureTimeWindowFrom: SearchFlightConstant.TIME_WINDOW_MIN,
          departureTimeWindowTo: SearchFlightConstant.TIME_WINDOW_MAX,
        });
      }

      /** 復路情報を置き換え */
      multicityBounds.push({
        originLocationCode: this.searchFlightData.roundTrip.departureDestinationLocationCode,
        destinationLocationCode:
          this.searchFlightData.roundTrip.returnConnection.connectionLocationCode && !this.oldDomesticAswSearchFlag
            ? this.searchFlightData.roundTrip.returnConnection.connectionLocationCode
            : this.searchFlightData.roundTrip.departureOriginLocationCode,
        connectionLocationCode: null,
        departureDate: this.searchFlightData.roundTrip.returnDate,
        departureTimeWindowFrom: this.searchFlightData.roundTrip.returnTimeWindowFrom,
        departureTimeWindowTo: this.searchFlightData.roundTrip.returnTimeWindowTo,
      });

      /** 復路乗継地が存在する場合置き換え */
      if (this.searchFlightData.roundTrip.returnConnection.connectionLocationCode && !this.oldDomesticAswSearchFlag) {
        multicityBounds.push({
          originLocationCode: this.searchFlightData.roundTrip.returnConnection.connectionLocationCode,
          destinationLocationCode: this.searchFlightData.roundTrip.departureOriginLocationCode,
          connectionLocationCode: null,
          departureDate: this.searchFlightData.roundTrip.returnDate,
          departureTimeWindowFrom: SearchFlightConstant.TIME_WINDOW_MIN,
          departureTimeWindowTo: SearchFlightConstant.TIME_WINDOW_MAX,
        });
      }

      /** DCS移行開始日前後状態の取得 */
      const dcsMigrationDateStatus = this._shoppingLibService.getDcsMigrationDateStatus(this.searchFlightData);
      //日本国内単独旅程かどうかを取得する。
      const isJapanOnlyTrip = this.searchFlightData.isJapanOnly;

      /** 保持している検索条件の項目を上書きする。 */
      const multicitySearchFlightState: SearchFlightState = {
        ...this.searchFlightData,
        tripType: TripType.ONEWAY_OR_MULTI_CITY,
        onewayOrMultiCity: multicityBounds,
        roundTrip: { ...searchFlightInitialState.roundTrip },
        fare: {
          ...this.searchFlightData.fare,
          isMixedCabin:
            multicityBounds.length !== 2 ||
            (posCountryCode !== 'JP' && isJapanOnlyTrip && dcsMigrationDateStatus === 'Before')
              ? false
              : this.searchFlightData.fare.isMixedCabin,
        },
        dcsMigrationDateStatus: dcsMigrationDateStatus,
      };
      multicitySearchFlightState.isJapanOnly = this.checkOnlyJapan(multicitySearchFlightState);
      this._searchFlightStoreService.updateStore(multicitySearchFlightState);
      this.changeAirport();
    }
    // FIXME:暫定対応 往復旅程から複雑旅程に切り替える部分のローディング終了処理
    this._loadingSvc.endLoading();
    this._changeDetectorRef.detectChanges();
  }

  /** 検索条件の状態を複雑旅程から往復旅程に置き換える */
  public replaceStateOneWayOrMulticityToRoundtrip() {
    if (this.searchFlightData.tripType === TripType.ONEWAY_OR_MULTI_CITY) {
      const roundTripSearchFlightState: SearchFlightState = {
        ...this.searchFlightData,
        tripType: TripType.ROUND_TRIP,
        roundTrip: {
          //往路出発地
          departureOriginLocationCode: this.searchFlightData.onewayOrMultiCity[0].originLocationCode,
          // 往路到着地
          departureDestinationLocationCode: this.searchFlightData.onewayOrMultiCity[0].destinationLocationCode,
          // 往路出発日
          departureDate: this.searchFlightData.onewayOrMultiCity[0].departureDate,
          // 往路出発時間帯 開始
          departureTimeWindowFrom: this.searchFlightData.onewayOrMultiCity[0].departureTimeWindowFrom,
          // 往路出発時間帯 終了
          departureTimeWindowTo: this.searchFlightData.onewayOrMultiCity[0].departureTimeWindowTo,
          // 復路出発地
          returnOriginLocationCode: this.searchFlightData.onewayOrMultiCity[0].destinationLocationCode,
          // 復路到着地
          returnDestinationLocationCode: this.searchFlightData.onewayOrMultiCity[0].originLocationCode,
          // 復路出発日
          returnDate:
            this.searchFlightData.onewayOrMultiCity.length >= 2
              ? this.searchFlightData.onewayOrMultiCity[1].departureDate
              : null,
          // 復路出発時間帯 開始
          returnTimeWindowFrom:
            this.searchFlightData.onewayOrMultiCity.length >= 2
              ? this.searchFlightData.onewayOrMultiCity[1].departureTimeWindowFrom
              : SearchFlightConstant.TIME_WINDOW_MIN,
          // 復路出発時間帯 終了
          returnTimeWindowTo:
            this.searchFlightData.onewayOrMultiCity.length >= 2
              ? this.searchFlightData.onewayOrMultiCity[1].departureTimeWindowTo
              : SearchFlightConstant.TIME_WINDOW_MAX,
          // 往路乗継情報
          departureConnection: {
            connectionLocationCode: null,
            connectionTime: null,
          },
          // 復路乗継情報
          returnConnection: {
            connectionLocationCode: null,
            connectionTime: null,
          },
        },
        onewayOrMultiCity: [{ ...searchFlightInitialState.onewayOrMultiCity[0] }],
        fare: { ...this.searchFlightData.fare },
      };
      roundTripSearchFlightState.isJapanOnly = this.checkOnlyJapan(roundTripSearchFlightState);
      this._searchFlightStoreService.updateStore(roundTripSearchFlightState);
      this.changeAirport();
    }
    // FIXME:暫定対応 往復旅程から複雑旅程に切り替える部分のローディング終了処理
    this._loadingSvc.endLoading();
    this._changeDetectorRef.detectChanges();
  }

  /**
   * 画面に埋め込まれたリクエストパラメータを読み込み検索条件に格納する
   * 必須項目のチェックは行わず、検索実行時のバリデータでチェックする
   */
  private fetchRequestParam() {
    //リクエストパラメータが存在する場合に実行する
    //他システムからリクエストされた空席照会のパラメータ POST
    const { query, post } = (window as any).Asw?.ApiRequestParam || {};
    const requestParam = {
      ...query,
      ...post,
    };
    const paramKeys = Object.keys(requestParam);
    const paramsNotCheckCondition1 =
      paramKeys.length === 1 && (paramKeys[0] === 'CONNECTION_KIND' || paramKeys[0] === 'LANG');
    const paramsNotCheckCondition2 =
      paramKeys.length === 2 && paramKeys.includes('CONNECTION_KIND') && paramKeys.includes('LANG');

    // CONNECTION_KINDとLANG以外のパラメータが連携された場合、入力チェックを行う。
    if (!(paramsNotCheckCondition1 || paramsNotCheckCondition2) && paramKeys.length !== 0) {
      // 流入パラメータを削除する
      delete (window as any).Asw?.ApiRequestParam;

      // 流入パラメータ
      this.requestParam = requestParam;

      // 以下の処理にて、リクエストパラメータのチェックを行う。
      const checkResult = this.checkRequestParam(requestParam);
      // エラーの場合、初期表示処理を終了する。
      if (!checkResult) {
        return false;
      }

      // 各変数初期化
      let state = searchFlightInitialState;
      let tripType: TripType = TripType.BLANK;
      let roundtrip = searchFlightInitialState.roundTrip;
      let onewayOrMulticity = searchFlightInitialState.onewayOrMultiCity;

      // リクエストパラメータ.旅程が存在しない、またはリクエストパラメータ.旅程=“roundtrip”(往復旅程)の場合
      if (!this._shoppingLibService.isNotEmpty(requestParam['trip']) || requestParam['trip'] === 'roundtrip') {
        //往復旅程の設定
        tripType = TripType.ROUND_TRIP;
        // 往復旅程区間作成
        roundtrip = this.createRoundtrip(requestParam);
      }
      //リクエストパラメータ.旅程=“onewayOrMulticity”(複雑旅程)の場合
      else {
        tripType = TripType.ONEWAY_OR_MULTI_CITY;
        onewayOrMulticity = this.createOnewayOrMulticity(requestParam);
      }
      // 検索条件を作成し、保持する
      state = {
        ...searchFlightInitialState,
        tripType: tripType,
        roundTrip: roundtrip,
        onewayOrMultiCity: onewayOrMulticity,
      };

      //画面項目の初期設定
      //ページを開いた時点での旅程で日本国内単独旅程判定
      //日本国内単独旅程かどうかを判定した結果を国内旅程かどうか(検索条件変更前)に設定する。
      this._prevJapanOnlyTrip = this.checkOnlyJapan(state);
      this._prevDcsMigrationDateStatus = this._shoppingLibService.getDcsMigrationDateStatus(state);

      // 区間関連以外の項目設定(共通検索条件設定)
      state.isJapanOnly = this._prevJapanOnlyTrip;
      state.dcsMigrationDateStatus = this._prevDcsMigrationDateStatus;
      state = this.setCommonItems(state, requestParam, this._prevJapanOnlyTrip);

      // ストアに格納し画面に反映
      // 画面表示内容に従って、画面の入力項目に保持している検索条件を設定する。
      this._searchFlightStoreService.updateStore(state);
      //入力値のチェック処理
      this.errorMessageForRequestParamMap = this.checkInputData(state.isJapanOnly, requestParam);
      // チェックがある場合、画面遷移せず、エラーを画面上に表示する。
      if (this.errorMessageForRequestParamMap.size > 0) {
        return false;
      }
      const search = requestParam['search'];
      const n = Number(search);
      // リクエストパラメータ.検索要否が存在しない、またはリクエストパラメータ.検索要否=“1”(検索する)の場合
      if (!this._shoppingLibService.isNotEmpty(search) || n === 1) {
        // 自動検索要否を判断
        this.autoSearch = true;
        // ローディング画面表示終了
        this._loadingSvc.endLoading();
        //検索を実行する場合
        return this.executeSearch();
      } else {
        // 画面遷移しない
        return false;
      }
    } else {
      //リクエストパラメータが存在しない場合
      if (this.isDisplayAgain()) {
        // フライト検索画面再表示の場合
        this._prevJapanOnlyTrip = this.searchFlightData.isJapanOnly;
        this._prevDcsMigrationDateStatus = this.searchFlightData.dcsMigrationDateStatus;
        return false;
      } else {
        const cabinClassOptions = this._shoppingLibService.getCabinList(this.searchFlightData.isJapanOnly);
        const defaultCabinClass = this.getDefaultCabinClass(cabinClassOptions);
        // フライト検索画面初回表示の場合
        //stateにデフォルト値を格納する
        const state: SearchFlightState = {
          ...searchFlightInitialState,
          fare: {
            isMixedCabin: false,
            cabinClass: defaultCabinClass,
            fareOptionType: this.getDefaultFareOptionType(defaultCabinClass, searchFlightInitialState),
            returnCabinClass: defaultCabinClass,
            awardOption: BookingTypeAwardOptionTypeEnum.BookingType0,
          },
        };
        //ストアに格納し画面に反映
        this._searchFlightStoreService.updateStore(state);
        return false;
      }
    }
  }

  /**
   * デフォルト運賃オプション選択値取得処理
   */
  private getDefaultFareOptionType(cabinClass: string, searchFlightState: SearchFlightState): string {
    const awardOption = searchFlightState.fare.awardOption || BookingTypeAwardOptionTypeEnum.BookingType0;
    const commercialFareFamily = this._shoppingLibService.getCommercialFareFamily(searchFlightState, awardOption);
    const fareOptionList = this._shoppingLibService.getCabinFareTypeListMap(commercialFareFamily).get(cabinClass);
    if (fareOptionList) {
      return fareOptionList.some((item) => item.value === SearchFlightConstant.UNSPECIFIED_FARE_OPTION)
        ? SearchFlightConstant.UNSPECIFIED_FARE_OPTION
        : fareOptionList[0].value;
    }
    return '';
  }

  /**
   * デフォルトキャビンクラス選択値取得処理
   */
  private getDefaultCabinClass(cabinClassOptions: CabinClassOptionList[]) {
    return cabinClassOptions.find(
      (item) => item.value === this._aswMasterSvc.getMPropertyByKey('search', 'defaultCabinClass')
    )
      ? this._aswMasterSvc.getMPropertyByKey('search', 'defaultCabinClass')
      : cabinClassOptions[0].value;
  }

  /**
   * 入力値のチェック処理
   */
  public checkInputData(
    isJapanOnly?: boolean,
    requestParam?: { [key: string]: string | number | boolean }
  ): Map<string, string | ValidationErrorInfo> {
    if (isJapanOnly == null) {
      isJapanOnly = this.checkOnlyJapan(this.searchFlightData);
    }

    let errorMessage: Map<string, string | ValidationErrorInfo> = new Map();
    const airportListKey = this._shoppingLibService.getAirportListKey(this.searchFlightData.tripType);
    const isEmptyOrUndefined = (value: any) => !value || Object.keys(value).length === 0;
    if (this.searchFlightData.tripType === TripType.ROUND_TRIP) {
      // リクエストパラメータが空以外の場合、または出発地・目的地のいずれかが指定されている場合にチェックしない
      if (
        isEmptyOrUndefined(requestParam) ||
        !(
          !isEmptyOrUndefined(requestParam) &&
          !this._shoppingLibService.isNotEmpty(requestParam?.['origin'] ?? '') &&
          !this._shoppingLibService.isNotEmpty(requestParam?.['destination'] ?? '')
        )
      ) {
        // 出発地に関するチェック
        this.checkDepartureAirport(
          this._aswMasterSvc.aswMaster[airportListKey.departureAirportListKey],
          this.searchFlightData.roundTrip.departureOriginLocationCode!,
          errorMessage
        );
        // 到着地に関するチェック
        this.checkDestinationAirport(
          this._aswMasterSvc.aswMaster[airportListKey.destinationAirportListKey],
          this.searchFlightData.roundTrip.departureDestinationLocationCode!,
          errorMessage
        );
        // 出発地と到着地が同一チェック
        this.checkSameAirport(
          this.searchFlightData.roundTrip.departureOriginLocationCode!,
          this.searchFlightData.roundTrip.departureDestinationLocationCode!,
          errorMessage
        );
      }

      // 往路出発日チェック
      this.checkDepartureDate(this.searchFlightData.roundTrip.departureDate!, errorMessage);
      // 復路出発日チェック
      this.checkReturnDate(this.searchFlightData.roundTrip.returnDate!, errorMessage);
      // DCS移行開始日前後チェック
      if (isJapanOnly && this._aswContextStoreSvc.aswContextData.posCountryCode === 'JP') {
        //国内のみ
        this.checkRoundTripDcsStartMixed(this.searchFlightData, errorMessage);
      }
    } else if (this.searchFlightData.tripType === TripType.ONEWAY_OR_MULTI_CITY) {
      let state = this.searchFlightData;
      if (this.oldDomesticAswSearchFlag) {
        const bound = state.onewayOrMultiCity.flatMap((item) => {
          return {
            ...item,
            departureTimeWindowFrom: SearchFlightConstant.TIME_WINDOW_MIN,
            departureTimeWindowTo: SearchFlightConstant.TIME_WINDOW_MAX,
          };
        });
        state = {
          ...state,
          onewayOrMultiCity: bound,
        };
      }
      state.onewayOrMultiCity.forEach((bound, index) => {
        if (
          !this._shoppingLibService.isNotEmpty(bound.destinationLocationCode) &&
          !this._shoppingLibService.isNotEmpty(bound.originLocationCode) &&
          !this._shoppingLibService.isNotEmpty(bound.departureDate) &&
          (!this._shoppingLibService.isNotEmpty(bound.departureTimeWindowFrom) ||
            bound.departureTimeWindowFrom === SearchFlightConstant.TIME_WINDOW_MIN) &&
          (!this._shoppingLibService.isNotEmpty(bound.departureTimeWindowTo) ||
            bound.departureTimeWindowTo === SearchFlightConstant.TIME_WINDOW_MAX)
        ) {
          // 未入力の場合
          return;
        } else if (
          !isEmptyOrUndefined(requestParam) &&
          !this._shoppingLibService.isNotEmpty(requestParam?.['origin' + (index + 1).toString()] ?? '') &&
          !this._shoppingLibService.isNotEmpty(requestParam?.['destination' + (index + 1).toString()] ?? '')
        ) {
          // リクエストパラメータが存在する場合、かつ出発地と目的地が空の場合はチェックしない
          return;
        } else {
          // 複雑旅程_出発地チェック
          this.checkOneWayDepartureAirports(
            this._aswMasterSvc.aswMaster[airportListKey.departureAirportListKey],
            this._aswMasterSvc.aswMaster[airportListKey.destinationAirportListKey],
            bound.originLocationCode!,
            errorMessage,
            index
          );
          // 複雑旅程_到着地チェック
          this.checkOneWayDestinationAirport(
            this._aswMasterSvc.aswMaster[airportListKey.destinationAirportListKey],
            bound.destinationLocationCode!,
            errorMessage,
            index
          );
          // 複雑旅程_出発地、到着地同一チェック
          this.checkOneWaySameAirport(bound.originLocationCode!, bound.destinationLocationCode!, errorMessage, index);
          // 複雑旅程_出発日チェック
          this.checkOneWayDepartureDate(bound.departureDate!, errorMessage, index);
        }
      });
      // DCS移行開始日前後チェック
      if (isJapanOnly && this._aswContextStoreSvc.aswContextData.posCountryCode === 'JP') {
        //国内のみ
        this.checkOnewayDcsStartMixed(this.searchFlightData, errorMessage);
      }
    }

    let departureDate;
    if (this.searchFlightData.tripType === 0) {
      departureDate = this.searchFlightData.roundTrip.departureDate;
    } else departureDate = this.searchFlightData.onewayOrMultiCity[0].departureDate;

    let travelarErrorMessageInfo = this._shoppingLibService.checkTraveler(
      this.searchFlightData.traveler.adt,
      this.searchFlightData.traveler.chd,
      this.searchFlightData.traveler.inf,
      isJapanOnly,
      departureDate!
    );
    if (travelarErrorMessageInfo !== '') {
      errorMessage.set('travelers', travelarErrorMessageInfo);
    }

    return errorMessage;
  }
  /** DCS移行開始日前後チェック */
  checkOnewayDcsStartMixed(
    searchFlightData: SearchFlightState,
    errorMessage: Map<string, string | ValidationErrorInfo>
  ) {
    const dcsStartFlg = this._shoppingLibService.getDcsMigrationDateStatus(searchFlightData);
    if (dcsStartFlg === 'Mixed') {
      searchFlightData.onewayOrMultiCity.forEach((item, index) => {
        if (this._shoppingLibService.isNotEmpty(item.departureDate)) {
          errorMessage.set('departureDate' + index, {
            errorMsgId: 'E0927',
          });
        }
      });
    }
  }

  /** DCS移行開始日前後チェック */
  checkRoundTripDcsStartMixed(
    searchFlightData: SearchFlightState,
    errorMessage: Map<string, string | ValidationErrorInfo>
  ) {
    const dcsStartFlg = this._shoppingLibService.getDcsMigrationDateStatus(searchFlightData);
    if (dcsStartFlg === 'Mixed') {
      errorMessage.set('departureDate', {
        errorMsgId: 'E0927',
      });
      errorMessage.set('returnDate', {
        errorMsgId: 'E0927',
      });
    }
  }

  /** 空港リストに空港が存在するチェック */
  private isAirportExist(airportList: Airport[], code: string): boolean {
    return airportList!.some((airport) => airport.search_for_airport_code === code);
  }

  /**エラーを各部品に設定する */
  public setErrorMessage(errorMessage: Map<string, string | ValidationErrorInfo>) {
    this.information.passengersErrorMsg = errorMessage.get('travelers') || '';
  }

  /**往復旅程_出発地チェック */
  public checkDepartureAirport(
    departureAirportList: Airport[],
    code: string,
    errorMessage: Map<string, string | ValidationErrorInfo>
  ) {
    if (!this._shoppingLibService.isNotEmpty(code)) {
      errorMessage.set('originLocationCode', {
        errorMsgId: 'E0002',
        params: {
          key: 0,
          value: this._staticMsg.transform('label.departureLocation'),
          dontTranslate: true,
        },
      });
    } else if (!this.isAirportExist(departureAirportList, code!)) {
      errorMessage.set('originLocationCode', 'E0059');
    }
  }

  /**往復旅程_到着地チェック */
  public checkDestinationAirport(
    destinationAirportList: Airport[],
    code: string,
    errorMessage: Map<string, string | ValidationErrorInfo>
  ) {
    if (!this._shoppingLibService.isNotEmpty(code)) {
      errorMessage.set('destinationLocationCode', {
        errorMsgId: 'E0002',
        params: {
          key: 0,
          value: this._staticMsg.transform('label.arrivalLocation'),
          dontTranslate: true,
        },
      });
    } else if (!this.isAirportExist(destinationAirportList, code!)) {
      errorMessage.set('destinationLocationCode', 'E0059');
    }
  }

  /**往復旅程_出発地、到着地同一チェック */
  public checkSameAirport(
    originLocationCode: string,
    destinationLocationCode: string,
    errorMessage: Map<string, string | ValidationErrorInfo>
  ) {
    if (
      !errorMessage.has('originLocationCode') &&
      !errorMessage.has('destinationLocationCode') &&
      originLocationCode === destinationLocationCode
    ) {
      errorMessage.set('originLocationCode', 'E0060');
      errorMessage.set('destinationLocationCode', 'E0060');
    }
  }

  /**往復旅程_往路出発日チェック */
  public checkDepartureDate(date: Date, errorMessage: Map<string, string | ValidationErrorInfo>) {
    if (!this._shoppingLibService.isNotEmpty(date)) {
      errorMessage.set('departureDate', {
        errorMsgId: 'E0002',
        params: {
          key: 0,
          value: this._staticMsg.transform('label.departReturnDays'),
          dontTranslate: true,
        },
      });
    }
  }
  /**往復旅程_復路出発日チェック */
  public checkReturnDate(date: Date, errorMessage: Map<string, string | ValidationErrorInfo>) {
    if (!this._shoppingLibService.isNotEmpty(date)) {
      errorMessage.set('returnDate', {
        errorMsgId: 'E0002',
        params: {
          key: 0,
          value: this._staticMsg.transform('label.departReturnDays'),
          dontTranslate: true,
        },
      });
    }
  }

  /**往復旅程_乗継地チェック */
  public checkConnectionLocationCode(
    transitAirportList: Airport[],
    connectionLocationCode: string | null,
    connectionTime: number | null,
    errorMessage: Map<string, string | ValidationErrorInfo>,
    key: string
  ) {
    if (!this.oldDomesticAswSearchFlag) {
      if (this._shoppingLibService.isNotEmpty(connectionLocationCode)) {
        if (!this.isAirportExist(transitAirportList, connectionLocationCode!)) {
          errorMessage.set(key, 'E0059');
        }
      } else {
        if (connectionTime) errorMessage.set(key, 'E1103');
      }
    }
  }

  /**複雑旅程_出発地チェック */
  public checkOneWayDepartureAirports(
    departureAirportList: Airport[],
    destinationAirportList: Airport[],
    code: string,
    errorMessage: Map<string, string | ValidationErrorInfo>,
    index: number
  ) {
    if (!this._shoppingLibService.isNotEmpty(code)) {
      errorMessage.set('originLocationCode' + index, {
        errorMsgId: 'E0002',
        params: {
          key: 0,
          value: this._staticMsg.transform('label.departureLocation'),
          dontTranslate: true,
        },
      });
    } else {
      let airportList;
      if (index === 0) {
        airportList = departureAirportList;
      } else {
        airportList = destinationAirportList;
      }
      if (!this.isAirportExist(airportList!, code!)) {
        errorMessage.set('originLocationCode' + index, 'E0059');
      }
    }
  }

  /**複雑旅程_到着地チェック */
  public checkOneWayDestinationAirport(
    destinationAirportList: Airport[],
    code: string,
    errorMessage: Map<string, string | ValidationErrorInfo>,
    index: number
  ) {
    if (!this._shoppingLibService.isNotEmpty(code)) {
      errorMessage.set('destinationLocationCode' + index, {
        errorMsgId: 'E0002',
        params: {
          key: 0,
          value: this._staticMsg.transform('label.arrivalLocation'),
          dontTranslate: true,
        },
      });
    } else if (!this.isAirportExist(destinationAirportList!, code!)) {
      errorMessage.set('destinationLocationCode' + index, 'E0059');
    }
  }

  /**複雑旅程_出発地、到着地同一チェック */
  public checkOneWaySameAirport(
    originLocationCode: string,
    destinationLocationCode: string,
    errorMessage: Map<string, string | ValidationErrorInfo>,
    index: number
  ) {
    if (
      !errorMessage.has('originLocationCode' + index) &&
      !errorMessage.has('destinationLocationCode' + index) &&
      originLocationCode === destinationLocationCode
    ) {
      errorMessage.set('originLocationCode' + index, 'E0060');
      errorMessage.set('destinationLocationCode' + index, 'E0060');
    }
  }

  /**複雑旅程_出発日チェック */
  public checkOneWayDepartureDate(date: Date, errorMessage: Map<string, string | ValidationErrorInfo>, index: number) {
    if (!this._shoppingLibService.isNotEmpty(date)) {
      errorMessage.set('departureDate' + index, {
        errorMsgId: 'E0002',
        params: {
          key: 0,
          value: this._staticMsg.transform('label.departureDate'),
          dontTranslate: true,
        },
      });
    }
  }

  /**
   * リクエストパラメータのチェック
   */
  private checkRequestParam(requestParam: { [key: string]: string | number | boolean }): boolean {
    // リクエストパラメータ.旅程が存在する、かつリクエストパラメータ.旅程≠“roundtrip”(往復旅程)、
    // かつリクエストパラメータ.旅程≠“onewayOrMulticity”(片道旅程)の場合、
    if (
      this._shoppingLibService.isNotEmpty(requestParam['trip']) &&
      requestParam['trip'] !== 'roundtrip' &&
      requestParam['trip'] !== 'onewayOrMulticity'
    ) {
      // 継続不可能エラー
      // ローディング画面表示終了
      this._loadingSvc.endLoading();
      this._common.errorsHandlerService.setNotRetryableError({
        errorType: ErrorType.BUSINESS_LOGIC,
        errorMsgId: 'E1066',
      });
      return false;
    }
    return true;
  }

  /**
   * yyyy-MM-dd形式の文字列として日付変換できるか
   */
  private isDateString(dateString: string): boolean {
    return !isNaN(Date.parse(dateString));
  }

  /**
   * 時間帯文字列判定
   */
  private isFromToTimeString(timeString: string): boolean {
    // 文字列が存在しない、または””(空欄)の場合、時間帯文字列でない
    if (!this._shoppingLibService.isNotEmpty(timeString)) {
      return false;
    }
    // 文字列を整数に変換する。変換できなかった場合、時間帯文字列でない
    let timeNum = Number(timeString);
    if (!Number.isInteger(timeNum)) {
      return false;
    }
    // 0～24か
    // 2で割った際の余りが0
    return 0 <= timeNum && timeNum <= 24 && timeNum % 2 === 0;
  }

  /**
   * 乗継時間文字列判定
   */
  private isConnectTimeString(timeString: string): boolean {
    // 文字列が存在しない、または””(空欄)の場合、時間帯文字列でない
    if (!this._shoppingLibService.isNotEmpty(timeString)) {
      return false;
    }
    // 文字列を整数に変換する。変換できなかった場合、時間帯文字列でない
    let timeNum = Number(timeString);
    if (!Number.isInteger(timeNum)) {
      return false;
    }
    // 0～990か
    // 30で割った際の余りが0
    return 0 <= timeNum && timeNum <= 990 && timeNum % 30 === 0;
  }

  /**
   * 往復旅程の検索条件設定
   */
  private createRoundtrip(requestParam: { [key: string]: string | number | boolean }) {
    // 往路出発日
    let departureDate: Date | null;
    // リクエストパラメータ.往路出発日が存在し、そのパラメータがyyyy-MM-dd形式の文字列として日付変換できる
    if (
      this._shoppingLibService.isNotEmpty(requestParam['departureDate']) &&
      this.isDateString(requestParam['departureDate'] as string)
    ) {
      const dateString = requestParam['departureDate'] as string;
      departureDate = this.convertStringToDate(dateString);
    } else {
      // 操作日(オフィス時間)に、プロパティ(カテゴリ：search)から
      // キー：”defaultDepartureDaysAfterToday”(第1出発加算日)を日数として加算した日付
      departureDate = this._localDateService.getCurrentDate();
      // 時刻部分を「00：00：00.000」に設定する
      departureDate.setHours(0, 0, 0, 0);
      departureDate.setDate(
        departureDate.getDate() +
          parseInt(this._aswMasterSvc.getMPropertyByKey('search', 'defaultDepartureDaysAfterToday'))
      );
    }

    // 往路出発時間帯開始・往路出発時間帯終了
    let departureTimeWindowFrom = requestParam['departureTimeFrom'] as string;
    let departureTimeWindowTo = requestParam['departureTimeTo'] as string;
    let departureTimeWindowEnable: boolean =
      this.isFromToTimeString(departureTimeWindowFrom) &&
      this.isFromToTimeString(departureTimeWindowTo) &&
      Number(departureTimeWindowFrom) < Number(departureTimeWindowTo);

    // 復路出発日
    let returnDate: Date | null;
    // リクエストパラメータ.復路出発日が存在し、そのパラメータがyyyy-MM-dd形式の文字列として日付変換できる
    if (
      this._shoppingLibService.isNotEmpty(requestParam['returnDate']) &&
      this.isDateString(requestParam['returnDate'] as string)
    ) {
      const dateString = requestParam['returnDate'] as string;
      returnDate = this.convertStringToDate(dateString);
    } else {
      //往路出発日に復路出発加算日を加算した日付
      returnDate = new Date(departureDate!);
      returnDate.setDate(
        departureDate!.getDate() +
          parseInt(this._aswMasterSvc.getMPropertyByKey('search', 'defaultAdditionalDaysToNextBound'))
      );
    }

    // 復路出発時間帯開始・復路出発時間帯終了
    let returnTimeWindowFrom = requestParam['returnTimeFrom'] as string;
    let returnTimeWindowTo = requestParam['returnTimeTo'] as string;
    let returnTimeWindowEnable: boolean =
      this.isFromToTimeString(returnTimeWindowFrom) &&
      this.isFromToTimeString(returnTimeWindowTo) &&
      Number(returnTimeWindowFrom) < Number(returnTimeWindowTo);

    // 往路乗継情報.最低乗継時間
    let departureConnectionTime = null;
    if (this.isConnectTimeString(requestParam['departureConnectionTime'] as string)) {
      departureConnectionTime = Number(requestParam['departureConnectionTime']);
    }

    // 復路乗継情報.最低乗継時間
    let returnConnectionTime = null;
    if (this.isConnectTimeString(requestParam['returnConnectionTime'] as string)) {
      returnConnectionTime = Number(requestParam['returnConnectionTime']);
    }

    // 区間オプション表示
    if (
      departureTimeWindowEnable ||
      this._shoppingLibService.isNotEmpty(requestParam['departureConnection']) ||
      returnTimeWindowEnable ||
      this._shoppingLibService.isNotEmpty(requestParam['returnConnection'])
    ) {
      this.isOpenSearchOption = true;
    }
    // 往復旅程の各項目を設定する
    const roundtrip = {
      departureOriginLocationCode: this._shoppingLibService.isNotEmpty(requestParam['origin'])
        ? (requestParam['origin'] as string)
        : null,
      departureDestinationLocationCode: this._shoppingLibService.isNotEmpty(requestParam['destination'])
        ? (requestParam['destination'] as string)
        : null,
      departureDate: departureDate,
      departureTimeWindowFrom: departureTimeWindowEnable
        ? this.convertHourToMins(departureTimeWindowFrom)
        : SearchFlightConstant.TIME_WINDOW_MIN,
      departureTimeWindowTo: departureTimeWindowEnable
        ? this.convertHourToMins(departureTimeWindowTo)
        : SearchFlightConstant.TIME_WINDOW_MAX,
      returnOriginLocationCode: this._shoppingLibService.isNotEmpty(requestParam['destination'])
        ? (requestParam['destination'] as string)
        : null,
      returnDestinationLocationCode: this._shoppingLibService.isNotEmpty(requestParam['origin'])
        ? (requestParam['origin'] as string)
        : null,
      returnDate: returnDate,
      returnTimeWindowFrom: returnTimeWindowEnable
        ? this.convertHourToMins(returnTimeWindowFrom)
        : SearchFlightConstant.TIME_WINDOW_MIN,
      returnTimeWindowTo: returnTimeWindowEnable
        ? this.convertHourToMins(returnTimeWindowTo)
        : SearchFlightConstant.TIME_WINDOW_MAX,
      departureConnection: {
        connectionLocationCode: this._shoppingLibService.isNotEmpty(requestParam['departureConnection'])
          ? (requestParam['departureConnection'] as string)
          : null,
        connectionTime: this._shoppingLibService.isNotEmpty(requestParam['departureConnection'])
          ? departureConnectionTime
          : null,
      },
      returnConnection: {
        connectionLocationCode: this._shoppingLibService.isNotEmpty(requestParam['returnConnection'])
          ? (requestParam['returnConnection'] as string)
          : null,
        connectionTime: this._shoppingLibService.isNotEmpty(requestParam['returnConnection'])
          ? returnConnectionTime
          : null,
      },
      isOpenSearchOption: this.isOpenSearchOption,
    };
    return roundtrip;
  }

  /**
   * 複雑旅程の検索条件設定
   */
  private createOnewayOrMulticity(requestParam: { [key: string]: string | number | boolean }) {
    let requestBoundsNum = 1;
    for (let i = this.MAX_BOUND_LIST_LENGTH; i >= 1; i--) {
      // 複雑旅程の必須リクエストパラメータの存在確認を行い、バウンド数を取得する
      if (
        this._shoppingLibService.isNotEmpty(requestParam['origin' + i.toString()]) ||
        this._shoppingLibService.isNotEmpty(requestParam['destination' + i.toString()]) ||
        (this._shoppingLibService.isNotEmpty(requestParam['departureDate' + i.toString()]) &&
          this.judgeStringDate(requestParam['departureDate' + i.toString()] as string)) ||
        this._shoppingLibService.isNotEmpty(requestParam['departureTimeFrom' + i.toString()]) ||
        this._shoppingLibService.isNotEmpty(requestParam['departureTimeTo' + i.toString()])
      ) {
        requestBoundsNum = i;
        break;
      }
    }
    //複雑旅程区間として空のリストを作成する。
    let onewayOrMulticity = [];
    for (let i = 1; i <= requestBoundsNum; i++) {
      let departureTimeWindowFrom = requestParam['departureTimeFrom' + i.toString()] as string;
      let departureTimeWindowTo = requestParam['departureTimeTo' + i.toString()] as string;
      let departureTimeWindowEnable: boolean =
        this.isFromToTimeString(departureTimeWindowFrom) &&
        this.isFromToTimeString(departureTimeWindowTo) &&
        Number(departureTimeWindowFrom) < Number(departureTimeWindowTo);
      let departureDate: Date | null;
      // リクエストパラメータの”departureDate” +  繰り返しインデックスが存在し、
      // そのパラメータがyyyy-MM-dd形式の文字列として日付変換できるする場合
      if (
        this._shoppingLibService.isNotEmpty(requestParam['departureDate' + i.toString()]) &&
        this.isDateString(requestParam['departureDate' + i.toString()] as string)
      ) {
        const dateString = requestParam['departureDate' + i.toString()];
        departureDate = this.convertStringToDate(dateString as string);
      } else {
        // 以下の処理にて算出した値
        if (i === 1) {
          departureDate = this._localDateService.getCurrentDate();
          // 時刻部分を「00：00：00.000」に設定する
          departureDate.setHours(0, 0, 0, 0);
          departureDate.setDate(
            departureDate.getDate() +
              parseInt(this._aswMasterSvc.getMPropertyByKey('search', 'defaultDepartureDaysAfterToday'))
          );
        } else {
          // 複雑旅程区間[繰り返しインデックス - 1].出発日に加算した日付
          departureDate = new Date(onewayOrMulticity[i - 2].departureDate!) as Date;
          departureDate.setDate(
            departureDate.getDate() +
              parseInt(this._aswMasterSvc.getMPropertyByKey('search', 'defaultAdditionalDaysToNextBound'))
          );
        }
      }
      // 各項目を設定する
      onewayOrMulticity.push({
        originLocationCode: this._shoppingLibService.isNotEmpty(requestParam['origin' + i.toString()])
          ? (requestParam['origin' + i.toString()] as string)
          : null,
        destinationLocationCode: this._shoppingLibService.isNotEmpty(requestParam['destination' + i.toString()])
          ? (requestParam['destination' + i.toString()] as string)
          : null,
        connectionLocationCode: null,
        departureDate: departureDate,
        departureTimeWindowFrom: departureTimeWindowEnable
          ? this.convertHourToMins(departureTimeWindowFrom)
          : SearchFlightConstant.TIME_WINDOW_MIN,
        departureTimeWindowTo: departureTimeWindowEnable
          ? this.convertHourToMins(departureTimeWindowTo)
          : SearchFlightConstant.TIME_WINDOW_MAX,
      });
    }
    return onewayOrMulticity;
  }

  // 案内済通貨コード変換
  private convertCurrencyCode(code: string): string | null {
    return code.length === 3 && !/[^A-Za-z]/.test(code) ? code.toUpperCase() : null;
  }

  // 案内済最安額変換
  private convertPriceValue(value: number | string): number | null {
    return this._shoppingLibService.isNotEmpty(value) && !Number.isNaN(Number(value)) ? Number(value) : null;
  }

  // 最安額連携値チェック
  private convertDisplayedValues(requestParam: any): {
    displayedTotalPrice: number | null;
    displayedBasePrice: number | null;
    displayedCurrency: string | null;
  } {
    let displayedTotalPrice: number | null = null;
    let displayedBasePrice: number | null = null;
    let displayedCurrency: string | null = null;

    let lowestPriceFirstCheck = !(
      !this._shoppingLibService.isNotEmpty(requestParam['displayedCurrency']) ||
      (this._shoppingLibService.isNotEmpty(requestParam['displayedTotalPrice']) &&
        this._shoppingLibService.isNotEmpty(requestParam['displayedBasePrice'])) ||
      (!this._shoppingLibService.isNotEmpty(requestParam['displayedTotalPrice']) &&
        !this._shoppingLibService.isNotEmpty(requestParam['displayedBasePrice']))
    );

    if (!lowestPriceFirstCheck) {
      // 通貨コードが存在しない、または最安支払総額と最安運賃額両方が存在する、または最安支払総額と最安運賃額両方が存在しない場合、すべて空欄として扱う
      displayedTotalPrice = null;
      displayedBasePrice = null;
      displayedCurrency = null;
    } else {
      let lowestPriceConvertCheck = true;
      // 変換
      displayedCurrency = this.convertCurrencyCode(requestParam['displayedCurrency']);
      displayedTotalPrice = this.convertPriceValue(requestParam['displayedTotalPrice']);
      displayedBasePrice = this.convertPriceValue(requestParam['displayedBasePrice']);
      if (!displayedCurrency || (displayedTotalPrice == null && displayedBasePrice == null)) {
        lowestPriceConvertCheck = false;
      }
      if (!lowestPriceConvertCheck) {
        // 通貨コードが変換失敗し、または最安支払総額と最安運賃額片方が存在しないかつ片方変換失敗の場合、すべて空欄として扱う
        displayedCurrency = null;
        displayedTotalPrice = null;
        displayedBasePrice = null;
      }
    }
    return {
      displayedTotalPrice,
      displayedBasePrice,
      displayedCurrency,
    };
  }

  /**
   * チェック済みキャビンクラス取得
   */
  private getCheckedCabinClass(cabinClass: string, japanOnly: boolean): string {
    if (this._shoppingLibService.isNotEmpty(cabinClass)) {
      return this._shoppingLibService.getCabinList(japanOnly).find((item) => item.value === cabinClass)
        ? cabinClass
        : '';
    } else {
      return '';
    }
  }

  /**
   * チェック済み運賃オプション取得
   */
  private getCheckedFareOption(
    cabinClass: string,
    fareOption: string,
    awardOption: string,
    japanOnly: boolean,
    state: SearchFlightState
  ): string {
    const commercialFareFamily = this._shoppingLibService.getCommercialFareFamily(this.searchFlightData, awardOption);
    // 会員かつ BookingType1特典検索条件指定されている場合のみ、運賃オプションが固定で'49'返却する
    if (!this._common.isNotLogin() && awardOption === BookingTypeAwardOptionTypeEnum.BookingType1) {
      return '49';
    } else if (this._shoppingLibService.isNotEmpty(cabinClass) && this._shoppingLibService.isNotEmpty(fareOption)) {
      return this._shoppingLibService.getCabinFareTypeListMap(commercialFareFamily).has(cabinClass) &&
        this._shoppingLibService
          .getCabinFareTypeListMap(commercialFareFamily)
          .get(cabinClass)!
          .find((item) => item.value === fareOption)
        ? fareOption
        : '';
    } else {
      return '';
    }
  }

  /**
   * 共通検索条件設定
   */
  private setCommonItems(
    state: SearchFlightState,
    requestParam: { [key: string]: string | number | boolean },
    japanOnly: boolean
  ): SearchFlightState {
    // 提携はモノクラスのため、cabinClassのリクエストパラメーターがないので、eco直書きにする
    const cabinClassForSmartDI = 'eco';

    const bookingType = (requestParam['bookingType'] as string) || '0';
    // bookingTypeからawardOptionを取得
    let awardOption = '';
    switch (bookingType.toString()) {
      case '0': // 有償検索
        awardOption = BookingTypeAwardOptionTypeEnum.BookingType0;
        break;
      case '1': // 特典検索
        awardOption = BookingTypeAwardOptionTypeEnum.BookingType1;
        break;
      case '2': // 有償・特典検索
        awardOption = BookingTypeAwardOptionTypeEnum.BookingType2;
        break;
      default:
        break;
    }
    // 不正な値を無視可能な項目について不正であるかどうかを判定する。
    // チェック済みキャビンクラス
    const checkedCabinClass = this.getCheckedCabinClass(cabinClassForSmartDI, japanOnly);

    // チェック済み運賃オプション
    const checkedFareOption = this.getCheckedFareOption(
      cabinClassForSmartDI,
      requestParam['fareOption'] as string,
      awardOption,
      japanOnly,
      state
    );

    // チェック済み復路キャビンクラス
    const checkedReturnCabinClass = this.getCheckedCabinClass(cabinClassForSmartDI, japanOnly);

    // 最安額連携値変換処理
    const lowestPrice = this.convertDisplayedValues(requestParam);
    const dcsMigrationDateStatus = this._shoppingLibService.getDcsMigrationDateStatus(state);
    //キャビンクラスの設定
    // チェック済みキャビンクラスが存在する、かつチェック済み復路キャビンクラスが存在する、
    // かつチェック済みキャビンクラス≠.チェック済み復路キャビンクラス、
    // かつ国内旅程かどうか=true、かつDCS移行開始日前後状態=”Before”)でない場合、true
    const isMixedCabin =
      this._shoppingLibService.isNotEmpty(checkedCabinClass) &&
      this._shoppingLibService.isNotEmpty(checkedReturnCabinClass) &&
      checkedCabinClass !== checkedReturnCabinClass &&
      !(japanOnly && dcsMigrationDateStatus === 'Before');

    let hasAccompaniedInAnotherReservation: boolean | null = null;
    if (requestParam['umnrType'] !== null && requestParam['umnrType'] !== undefined) {
      //小児単独予約は1の場合、別予約同行者有無はtrue。それ以外の場合、別予約同行者有無はfalse
      hasAccompaniedInAnotherReservation = requestParam['umnrType'] === '1' || requestParam['umnrType'] === 1;
    }

    const posCountryCode = this._common.aswContextStoreService.aswContextData.posCountryCode;
    const oldDomesticAswSearchFlag = this._shoppingLibService.getOldDomesticAswSearchFlag(state, posCountryCode);

    let maxAdtCount = 0;
    const maxChdCount = this._shoppingLibService.determineMaxChildCount(
      posCountryCode,
      dcsMigrationDateStatus,
      japanOnly
    );
    let maxInfCount = 0;
    // 上限人数設定
    if (oldDomesticAswSearchFlag) {
      (maxAdtCount = OldDomesticAswMaxPassengersCount.ADULT), (maxInfCount = OldDomesticAswMaxPassengersCount.INFANT);
    } else {
      (maxAdtCount = MaxPassengersCount.ADULT), (maxInfCount = MaxPassengersCount.INFANT);
    }

    // flexibleDatesのブーリアン変換
    let flexibleDates = true;
    if (
      this._shoppingLibService.isNotEmpty(requestParam['flexibleDates']) &&
      (requestParam['flexibleDates'] === '0' || requestParam['flexibleDates'] === 0)
    ) {
      flexibleDates = false;
    }

    const cabinList = this._shoppingLibService.getCabinList(japanOnly);
    const cabinClass = this._shoppingLibService.isNotEmpty(checkedCabinClass)
      ? checkedCabinClass
      : this.getDefaultCabinClass(cabinList);
    const returnCabinClass =
      this._shoppingLibService.isNotEmpty(checkedReturnCabinClass) && isMixedCabin
        ? checkedReturnCabinClass
        : this.getDefaultCabinClass(cabinList);
    const fareOptionType =
      this._shoppingLibService.isNotEmpty(checkedFareOption) && !isMixedCabin
        ? checkedFareOption
        : this.getDefaultFareOptionType(cabinClass, state);
    // 作成した検索条件に以下を追加する
    const searchFlightState = {
      ...state,
      // 搭乗者数
      traveler: {
        adt: this.toTravelerNumber(
          requestParam['ADT'],
          this._aswMasterSvc.getMPropertyByKey('search', 'defaultNumberOfAdults'),
          maxAdtCount
        ),
        b15: 0,
        chd: this.toTravelerNumber(
          requestParam['CHD'],
          this._aswMasterSvc.getMPropertyByKey('search', 'defaultNumberOfChild'),
          maxChdCount
        ),
        inf: this.toTravelerNumber(
          requestParam['INF'],
          this._aswMasterSvc.getMPropertyByKey('search', 'defaultNumberOfInfant'),
          maxInfCount
        ),
      },
      // 運賃情報
      fare: {
        isMixedCabin: isMixedCabin,
        cabinClass: cabinClass,
        fareOptionType: fareOptionType,
        returnCabinClass: returnCabinClass,
        awardOption: awardOption,
      },
      // プロモーション情報
      promotion: {
        code: '',
      },
      // 追加処理情報
      searchPreferences: {
        getAirCalendarOnly: false,
        getLatestOperation: true,
      },
      // 最安額連携情報
      lowestPrice: {
        displayedTotalPrice: lowestPrice.displayedTotalPrice,
        displayedBasePrice: lowestPrice.displayedBasePrice,
        displayedCurrency: lowestPrice.displayedCurrency,
      },
      // 画面表示用情報
      displayInformation: {
        compareFaresNearbyDates: flexibleDates,
        nextPage: '',
      },
      // 小児単独予約
      hasAccompaniedInAnotherReservation: hasAccompaniedInAnotherReservation,
    };
    return searchFlightState;
  }
  @ViewChild('searchFlightBodyPresComponent', { static: false })
  searchFlightBodyPresComponent?: SearchFlightBodyPresComponent;
  /** 検索処理の実行 */
  public executeSearch() {
    //日本国内単独旅程判定処理
    const japanOnlyFlag = this.checkOnlyJapan(this.searchFlightData);

    // 検索条件入力チェック
    if (!this.searchFlightInputCheck(japanOnlyFlag)) {
      return false;
    }

    // 次画面遷移前のリクエスト設定(マージ処理含む)
    return this.executeSceneTransition();
  }

  /** 検索条件入力チェック */
  private searchFlightInputCheck(japanOnlyFlag: boolean) {
    // 処理結果が未入力であると判定されなかった複雑旅程区間を区間情報リストを作成する。
    const boundList = this.searchFlightData.onewayOrMultiCity.filter((bound) => {
      return bound.originLocationCode && bound.destinationLocationCode && bound.departureDate;
    });

    const posCountryCode = this._aswContextStoreSvc.aswContextData.posCountryCode;
    const dcsMigrationDateStatus = this._shoppingLibService.getDcsMigrationDateStatus(this.searchFlightData);
    if (posCountryCode === 'JP' && japanOnlyFlag && dcsMigrationDateStatus !== 'After') {
      // エラー状態フラグ
      let oneWayOrMulticityFlag: boolean = false;
      if (this.searchFlightData.tripType === 1) {
        oneWayOrMulticityFlag = this.checkOneWayOrMulticityParam(boundList);
      }

      if (oneWayOrMulticityFlag || this.searchFlightData.fare.isMixedCabin) {
        // 旧国内ASWの空席照会結果画面にて検索はできない旨
        this._errorsHandlerSvc.setRetryableError(PageType.PAGE, { errorMsgId: 'E0929' });
        return false;
      }
    }
    // 保持している検索条件.旅程種別=1(複雑旅程)の場合
    if (this.searchFlightData.tripType === 1) {
      // 検索条件に出発日、出発地、到着地が同一の区間が2区間以上存在するチェック
      for (let i = 0; i <= boundList.length - 2; i++) {
        for (let j = i + 1; j <= boundList.length - 1; j++) {
          if (
            this.convertDateToFormatDateString(boundList[i].departureDate) ===
              this.convertDateToFormatDateString(boundList[j].departureDate) &&
            boundList[i].originLocationCode === boundList[j].originLocationCode &&
            boundList[i].destinationLocationCode === boundList[j].destinationLocationCode
          ) {
            this._errorsHandlerSvc.setRetryableError(PageType.PAGE, { errorMsgId: 'E0239' });
            return false;
          }
        }
      }
    }

    /**
     * 日付処理計算
     * 往復旅程
     * 前区間の出発日より2日以上前の出発日を設定できないチェック
     */
    // 日付不整合エラーチェック
    if (this.searchFlightData.roundTrip.returnDate !== null) {
      const pPreturnDate: Date = new Date(this.searchFlightData.roundTrip.returnDate);
      const departureDate: Date = new Date(this.searchFlightData.roundTrip.departureDate!);
      departureDate.setDate(departureDate.getDate() - 1);
      // 保持している検索条件.旅程種別=0(往復旅程)、
      // かつ保持している検索条件.往復旅程区間.復路出発日≦保持している検索条件.往復旅程区間.往路出発日-1日の場合
      if (this.searchFlightData.tripType === 0 && pPreturnDate <= departureDate) {
        this._errorsHandlerSvc.setRetryableError(PageType.PAGE, { errorMsgId: 'E1064' });
        return false;
      }
    }

    /**
     * 　保持している検索条件.旅程種別=1(複雑旅程)、かつ未入力なし区間情報リストの要素数≧2の場合、以下の処理を行う。
        ＜以下、0から保持している検索条件.未入力なし区間情報リストの要素数-2まで繰り返し(繰り返しインデックスを「i」とする)＞
        未入力なし区間情報リストの要素数[ i+1 ].出発日≦未入力なし区間情報リストの要素数[ i ].出発日-1日の場合、エラーメッセージID＝”E1064”(前区間の出発日より1日以上前の出発日を設定できない旨)にて継続可能なエラー情報を指定し、当画面でエラーメッセージを表示する。継続可能なエラー情報を指定し、当画面でエラーメッセージを表示する。
        ＜ここまで、0から未入力なし区間情報リストの要素数-2まで繰り返し＞
     */
    if (this.searchFlightData.tripType === 1 && boundList.length >= 2) {
      for (let i = 0; i <= boundList.length - 2; i++) {
        const prepareDepartureDate: Date = new Date(boundList[i].departureDate!);
        prepareDepartureDate.setDate(boundList[i].departureDate!.getDate() - 1);
        const departureDate: Date = new Date(boundList[i + 1].departureDate!);
        if (departureDate <= prepareDepartureDate) {
          this._errorsHandlerSvc.setRetryableError(PageType.PAGE, { errorMsgId: 'E1064' });
          return false;
        }
      }
    }

    /**
     *ユーザ共通.操作オフィスコード=APFオフィス、かつ日本国内単独旅程かどうか=trueの場合
     エラーメッセージID＝”E1065”(日本以外の発着地を1件以上指定する必要がある旨)にて継続可能なエラー情報を指定し、当画面でエラーメッセージを表示する。
     */
    const officeCode = this._common.aswContextStoreService.aswContextData.pointOfSaleId;
    if (officeCode === APF_OFFICE_CODE && japanOnlyFlag) {
      this._errorsHandlerSvc.setRetryableError(PageType.PAGE, { errorMsgId: 'E1065' });
      return false;
    }

    /**
       * 以下の条件をすべて満たす場合、エラーメッセージID＝”E1077”(指定した運賃オプションは当日でないと予約不可の旨)にて継続可能なエラー情報を指定し、当画面でエラーメッセージを表示する。
        ユーザ共通.POS国コード=”JP”(日本)
        日本国内単独旅程かどうか=true
        保持している検索条件.運賃情報.運賃オプションが存在し、運賃オプション=”23”(シニア)、”24”(ユース)のいずれか
        以下いずれかを満たす
        保持している検索条件.旅程種別=0(往復旅程)、かつ保持している検索条件.往復旅程区間.往路出発日≠操作日(オフィス時間)、かつ保持している検索条件.往復旅程区間.復路出発日≠操作日(オフィス時間)
        保持している検索条件.旅程種別=1(複雑旅程)、かつ保持している検索条件.複雑旅程区間について、当該複雑旅程区間.出発日≠操作日(オフィス時間)となる複雑旅程区間が存在しない
        */
    const fareOptionCheck =
      this._shoppingLibService.isNotEmpty(this.searchFlightData.fare.fareOptionType) &&
      (this.searchFlightData.fare.fareOptionType === '11' || this.searchFlightData.fare.fareOptionType === '12');
    if (posCountryCode === 'JP' && japanOnlyFlag && fareOptionCheck) {
      const systemDate = this._systemDateSvc.getSystemDate();
      const operationDate = new Date(systemDate.getFullYear(), systemDate.getMonth(), systemDate.getDate()).getTime();
      let isError = false;
      if (this.searchFlightData.tripType === 0) {
        isError =
          this.searchFlightData.roundTrip.departureDate?.getTime() !== operationDate ||
          this.searchFlightData.roundTrip.returnDate?.getTime() !== operationDate;
      } else if (this.searchFlightData.tripType === 1) {
        isError = boundList.some((b) => b.departureDate?.getTime() !== operationDate);
      }
      if (isError) {
        this._errorsHandlerSvc.setRetryableError(PageType.PAGE, { errorMsgId: 'E1077' });
        return false;
      }
    }

    // 特典予約かつ出発日が本日の場合、当日特典予約不可の旨のエラーメッセージ表示
    if (this.searchFlightData.fare.awardOption === BookingTypeAwardOptionTypeEnum.BookingType1) {
      const systemDate = this._systemDateSvc.getSystemDate();
      const operationDate = new Date(systemDate.getFullYear(), systemDate.getMonth(), systemDate.getDate()).getTime();
      let isError = false;
      if (this.searchFlightData.tripType === 0) {
        // 往復
        isError = this.searchFlightData.roundTrip.departureDate?.getTime() === operationDate;
      } else if (this.searchFlightData.tripType === 1) {
        // 片道/複雑
        isError = boundList.some((b) => b.departureDate?.getTime() === operationDate);
      }
      if (isError) {
        this._errorsHandlerSvc.setRetryableError(PageType.PAGE, { errorMsgId: 'EA043' });
        return false;
      }
    }

    // 特典/混在かつ往復ではない2区間で予約する際、予約不可の旨のエラーメッセージ表示
    if (
      this.searchFlightData.fare.awardOption !== BookingTypeAwardOptionTypeEnum.BookingType0 &&
      this.searchFlightData.tripType === 1 &&
      boundList.length === 2 &&
      boundList[0].originLocationCode !== boundList[1].destinationLocationCode
    ) {
      this._errorsHandlerSvc.setRetryableError(PageType.PAGE, { errorMsgId: 'EA044' });
      return false;
    }

    // 特典/混在の場合、3区間以上の予約を不可とする旨のエラーメッセージ表示
    if (
      this.searchFlightData.fare.awardOption !== BookingTypeAwardOptionTypeEnum.BookingType0 &&
      boundList.length >= 3
    ) {
      this._errorsHandlerSvc.setRetryableError(PageType.PAGE, { errorMsgId: 'EA045' });
      return false;
    }

    /**
     * 以下の条件を満たすの場合、エラーメッセージID＝”E0930”(予約可能な人数に上限がある旨)にて継続可能なエラー情報を指定し、当画面でエラーメッセージを表示する。
     */
    const totalTravelers = this.searchFlightData.traveler.adt + this.searchFlightData.traveler.chd;
    if (posCountryCode === 'JP' && japanOnlyFlag && dcsMigrationDateStatus !== 'After' && totalTravelers >= 7) {
      this._errorsHandlerSvc.setRetryableError(PageType.PAGE, { errorMsgId: 'E0930' });
      return false;
    }

    if (this.searchFlightData.traveler.adt === 0 && this.searchFlightData.traveler.chd !== 0) {
      /**
       * 以下の条件を満たすの場合、
       * エラーメッセージID＝”E0932”(小児のみの予約ができない旨)にて継続可能なエラー情報を指定し、当画面でエラーメッセージを表示する。
       */
      if (!japanOnlyFlag || (posCountryCode !== 'JP' && japanOnlyFlag && dcsMigrationDateStatus === 'Before')) {
        this._errorsHandlerSvc.setRetryableError(PageType.PAGE, { errorMsgId: 'E0932' });
        return false;
      }
      /**
       * 以下の条件を満たすの場合、
       * エラーメッセージID＝”E0931”(小児単独で予約時は大人の同行有無を指定してもらう必要がある旨)にて継続可能なエラー情報を指定し、当画面でエラーメッセージを表示する。
       */
      if (!this._shoppingLibService.isNotEmpty(this.searchFlightData.hasAccompaniedInAnotherReservation)) {
        this._otherBookingPassengerModalService.openModal({
          isOtherBookingPassenger: this.searchFlightData.hasAccompaniedInAnotherReservation,
        });
        this._errorsHandlerSvc.setRetryableError(PageType.PAGE, { errorMsgId: 'E0931' });
        return false;
      }
    }
    // オフィスの下2桁を求める
    if (officeCode.endsWith('AA') || officeCode.endsWith('DD')) {
      this.suffixCode = dcsMigrationDateStatus === 'After' && japanOnlyFlag ? 'DD' : 'AA';
    } else {
      this.suffixCode = officeCode.slice(-2);
    }

    const cardData = this._currentCartStoreService.CurrentCartData.data;
    // プラン確認画面(R01-P040)受け渡し情報.操作中カート情報.dataが存在する、
    // かつ求めた操作オフィスの下2桁≠ユーザ共通.操作オフィスコードの下2桁の場合
    if (cardData && cardData.cartId && this.suffixCode !== officeCode.slice(-2)) {
      // エラーメッセージID＝”E1076”(国際旅程から国内単独旅程または国内単独旅程から国際旅程への旅程変更はできない旨)
      // にて継続可能なエラー情報を指定し、当画面でエラーメッセージを表示する。
      this._errorsHandlerSvc.setRetryableError(PageType.PAGE, { errorMsgId: 'E1076' });
      return false;
    }
    // 搭乗者人数（ADT+CHD。INFは含めない）が3名以上かつ
    // 運賃オプションに「障がい者割引」が選択された状態で「検索する」ボタンが押下された場合、エラーとする
    const isDisabilityDiscount = this.appConstants.FARE_OPTION_DISABILITY_DISCOUNT.some(
      (val) => val === Number(this.searchFlightData.fare.fareOptionType)
    );
    if (isDisabilityDiscount && this.searchFlightData.traveler.adt + this.searchFlightData.traveler.chd >= 3) {
      this._errorsHandlerSvc.setRetryableError(PageType.PAGE, { errorMsgId: 'EA060' });
      return false;
    }
    return true;
  }

  /**
   *次画面遷移準備処理
   */
  private executeSceneTransition(): boolean {
    let itineraries: Array<RoundtripOwdRequestItinerariesInner> = [];
    // 往復旅程の場合
    if (this.searchFlightData.tripType === TripType.ROUND_TRIP) {
      // 往復旅程空席照会リクエスト用のitinerariesリストを作成
      itineraries = this.buildRoundTripItineraries(itineraries, this.searchFlightData);
      // 複雑旅程の場合
    } else if (this.searchFlightData.tripType === TripType.ONEWAY_OR_MULTI_CITY) {
      // 処理結果が未入力であると判定されなかった複雑旅程区間を区間情報リストを作成する。
      const boundList = this.searchFlightData.onewayOrMultiCity.filter((bound) => {
        return bound.originLocationCode && bound.destinationLocationCode && bound.departureDate;
      });
      //複雑旅程の場合、検索条件のマージ処理を行い、マージ後の検索条件をAPIリクエストパラメータとする
      const mergedBoundList: Array<Bound> = this.mergeBoundList(boundList);
      // 複雑旅程空席照会リクエスト用のitinerariesリストを作成
      itineraries = this.buildOnewayOrMultiCityItineraries(itineraries, mergedBoundList);
    }

    // 旧国内ASWの空席照会結果画面へ遷移処理
    const isJapanOnlyFlag = this.checkOnlyJapan(this.searchFlightData);
    // DCS移行開始日前後状態の取得
    const dcsMigrationDateStatus = this._shoppingLibService.getDcsMigrationDateStatus(this.searchFlightData);

    // 空席照会リクエスト用検索条件を設定する
    const searchFlightForRequest = this.buildNextScreenRequest(itineraries, this.searchFlightData, {
      isJapanOnlyFlag,
      dcsMigrationDateStatus,
    });
    // 求めた操作オフィスの下2桁≠ユーザ共通.操作オフィスコードの下2桁の場合、オフィス/言語変更APIを呼び出す
    const officeCode = this._common.aswContextStoreService.aswContextData.pointOfSaleId;
    if (this.suffixCode !== officeCode.slice(-2)) {
      const newOfficeCode = officeCode.slice(0, officeCode.length - 2) + this.suffixCode;

      // ユーザ共通情報をオフィス/言語変更APIレスポンス.dataにて上書きし、以降の処理を継続する。
      this._common.aswContextStoreService.updateAswContext({ pointOfSaleId: newOfficeCode });
    }

    // 空席照会リクエスト用検索条件storeに格納を行い、遷移先の照会結果画面で実行する。
    this._searchFlightConditionForRequestService.updateStore(searchFlightForRequest);
    return true;
  }

  /** 複雑旅程の区間マージ処理
   * @param boundList:マージ処理前の複雑旅程情報
   * @returns Array<Bound>　マージ処理済みの複雑旅程情報
   */
  private mergeBoundList(boundList: Array<Bound>): Array<Bound> {
    const BoundToMergeList: Array<BoundToMerge> = [];
    if (boundList.length >= 2) {
      //区間情報リストを作成
      for (const bound of boundList) {
        const OriginAirportInfo = this.AirportI18n_SearchForAirportCode[bound.originLocationCode!][0];
        const DestinationAirportInfo = this.AirportI18n_SearchForAirportCode[bound.destinationLocationCode!][0];
        BoundToMergeList.push({
          // 出発地
          originLocationCode: bound.originLocationCode,
          // 到着地
          destinationLocationCode: bound.destinationLocationCode,
          // 出発日
          departureDate: bound.departureDate,
          // 出発時間帯開始
          departureTimeWindowFrom: bound.departureTimeWindowFrom,
          // 出発時間帯終了
          departureTimeWindowTo: bound.departureTimeWindowTo,
          // 経由地都市
          transitLocationCode: '',
          // 出発空港情報
          originAirportInfo: OriginAirportInfo,
          // 到着空港情報
          destinationAirportInfo: DestinationAirportInfo,
          // マージ対象フラグ
          mergeFlag: false,
        });
      }
      // マージ対象になる区間を判定する

      for (let i = 0; i < BoundToMergeList.length - 1; i++) {
        /**
         *  国内旅程かどうか(検索条件変更前)=false
         *  当該区間情報.出発空港情報が存在する
         *  当該区間情報.到着空港情報が存在する
         *  当該区間情報.出発空港情報.国コード(2レター)≠次レコード区間情報.到着空港情報.国コード(2レター)
         *  当該区間情報.到着空港情報.都市コード=次レコード区間情報.出発空港情報.都市コード
         */
        if (
          this._prevJapanOnlyTrip === false &&
          BoundToMergeList[i].originAirportInfo &&
          BoundToMergeList[i].destinationAirportInfo &&
          BoundToMergeList[i].originAirportInfo?.country_2letter_code !==
            BoundToMergeList[i + 1].destinationAirportInfo?.country_2letter_code &&
          BoundToMergeList[i].destinationAirportInfo?.city_code === BoundToMergeList[i + 1].originAirportInfo?.city_code
        ) {
          // 次レコード区間情報.出発日–1日作成
          const prevDate: Date = new Date();
          prevDate.setTime(BoundToMergeList[i + 1].departureDate!.getTime());
          prevDate.setDate(prevDate.getDate() - 1);
          /**
           *  当該区間情報.出発日=次レコード区間情報.出発日
           *  当該区間情報.出発日=次レコード区間情報.出発日–1日
           */
          if (
            BoundToMergeList[i].departureDate?.toLocaleDateString() ==
              BoundToMergeList[i + 1].departureDate?.toLocaleDateString() ||
            BoundToMergeList[i].departureDate?.toLocaleDateString() === prevDate.toLocaleDateString()
          ) {
            // 経由地都市
            const mergedTransitLocationCode = BoundToMergeList[i].destinationAirportInfo?.city_code;
            // 到着地
            const mergedDestinationLocationCode = BoundToMergeList[i + 1].destinationLocationCode;
            BoundToMergeList[i] = {
              ...BoundToMergeList[i],
              // 経由地都市
              transitLocationCode: mergedTransitLocationCode!,
              // 到着地
              destinationLocationCode: mergedDestinationLocationCode,
              // マージ対象フラグ
              mergeFlag: true,
            };
          }
        }
      }
      // マージ非対称設定
      let processedIndex = 0;
      for (let i = 0; i < BoundToMergeList.length; i++) {
        if (BoundToMergeList[i].mergeFlag) {
          //マージ対象の場合、次の区間の処理へ
          continue;
        } else {
          if (i - processedIndex >= 2) {
            for (let j = processedIndex; j < i; j++) {
              BoundToMergeList[j] = {
                ...BoundToMergeList[j],
                // 経由地都市、到着地とマージ対象フラグを元に戻す
                transitLocationCode: '',
                destinationLocationCode: boundList[j].destinationLocationCode,
                mergeFlag: false,
              };
            }
          }
        }
        processedIndex = i + 1;
      }
      //マージに不要な区間削除
      const max = BoundToMergeList.length;
      for (let i = 0; i < max; i++) {
        if (i >= BoundToMergeList.length - 1) {
          break;
        }
        if (BoundToMergeList[i].mergeFlag) {
          BoundToMergeList.splice(i + 1, 1);
        }
      }
      //マージ後の検索条件を作成する
      const mergedBoundList: Array<Bound> = [];
      for (const mergedBound of BoundToMergeList) {
        mergedBoundList.push({
          // 出発地
          originLocationCode: mergedBound.originLocationCode,
          // 到着地
          destinationLocationCode: mergedBound.destinationLocationCode,
          // 乗継地
          connectionLocationCode: mergedBound.transitLocationCode,
          // 出発日
          departureDate: mergedBound.departureDate,
          // 出発時間帯開始
          departureTimeWindowFrom: mergedBound.departureTimeWindowFrom,
          // 出発時間帯終了
          departureTimeWindowTo: mergedBound.departureTimeWindowTo,
        });
      }
      return mergedBoundList;
    } else {
      return boundList;
    }
  }

  /** 往復旅程 空席照会リクエスト用のitinerariesリストを作成
   * @param itineraries:空itinerariesリスト
   * @param SearchFlightState:保存された検査条件
   * @returns Array<RoundtripOwdRequestItinerariesInner>　作成したitinerariesリスト
   */
  private buildRoundTripItineraries(
    itineraries: Array<RoundtripOwdRequestItinerariesInner>,
    SearchFlightState: SearchFlightState
  ): Array<RoundtripOwdRequestItinerariesInner> {
    // 往路出発時間帯の値変換
    let departureTimeWindowFrom: string | undefined = undefined;
    let departureTimeWindowTo: string | undefined = undefined;
    if (
      SearchFlightState.roundTrip.departureTimeWindowFrom !== SearchFlightConstant.TIME_WINDOW_MIN ||
      SearchFlightState.roundTrip.departureTimeWindowTo !== SearchFlightConstant.TIME_WINDOW_MAX
    ) {
      departureTimeWindowFrom = this.formatDepartureTimeForAPI(SearchFlightState.roundTrip.departureTimeWindowFrom!);
      departureTimeWindowTo = this.formatDepartureTimeForAPI(SearchFlightState.roundTrip.departureTimeWindowTo!);
    }
    // 復路出発時間帯の値変換
    let returnTimeWindowFrom: string | undefined = undefined;
    let returnTimeWindowTo: string | undefined = undefined;
    if (
      SearchFlightState.roundTrip.returnTimeWindowFrom !== SearchFlightConstant.TIME_WINDOW_MIN ||
      SearchFlightState.roundTrip.returnTimeWindowTo !== SearchFlightConstant.TIME_WINDOW_MAX
    ) {
      returnTimeWindowFrom = this.formatDepartureTimeForAPI(SearchFlightState.roundTrip.returnTimeWindowFrom!);
      returnTimeWindowTo = this.formatDepartureTimeForAPI(SearchFlightState.roundTrip.returnTimeWindowTo!);
    }
    //往復旅程の場合のAPIリクエストパラメータを設定
    itineraries = [
      {
        // 往路出発地
        originLocationCode: SearchFlightState.roundTrip.departureOriginLocationCode!,
        // 往路到着地
        destinationLocationCode: SearchFlightState.roundTrip.departureDestinationLocationCode!,
        // 往路出発日
        departureDate: this.convertDateToFormatDateString(SearchFlightState.roundTrip.departureDate!),
        // 往路出発時間帯開始
        departureTimeWindowFrom: departureTimeWindowFrom,
        // 往路出発時間帯終了
        departureTimeWindowTo: departureTimeWindowTo,
        // 往路乗継情報
        connection: this._shoppingLibService.isNotEmpty(
          SearchFlightState.roundTrip.departureConnection.connectionLocationCode
        )
          ? {
              // 乗継地
              locationCodes: [SearchFlightState.roundTrip.departureConnection.connectionLocationCode!],
              // 最低乗継時間
              time:
                SearchFlightState.roundTrip.departureConnection.connectionTime != null &&
                SearchFlightState.roundTrip.departureConnection.connectionTime != 0
                  ? SearchFlightState.roundTrip.departureConnection.connectionTime
                  : undefined,
            }
          : undefined,
      },
      {
        // 復路出発地
        originLocationCode: SearchFlightState.roundTrip.returnOriginLocationCode!,
        // 復路到着地
        destinationLocationCode: SearchFlightState.roundTrip.returnDestinationLocationCode!,
        // 復路出発日
        departureDate: this.convertDateToFormatDateString(SearchFlightState.roundTrip.returnDate!),
        // 復路出発時間帯開始
        departureTimeWindowFrom: returnTimeWindowFrom,
        // 復路出発時間帯終了
        departureTimeWindowTo: returnTimeWindowTo,
        // 復路乗継情報
        connection: this._shoppingLibService.isNotEmpty(
          SearchFlightState.roundTrip.returnConnection.connectionLocationCode
        )
          ? {
              // 乗継地
              locationCodes: [SearchFlightState.roundTrip.returnConnection.connectionLocationCode!],
              // 最低乗継時間
              time:
                SearchFlightState.roundTrip.returnConnection.connectionTime != null &&
                SearchFlightState.roundTrip.returnConnection.connectionTime != 0
                  ? SearchFlightState.roundTrip.returnConnection.connectionTime
                  : undefined,
            }
          : undefined,
      },
    ];
    return itineraries;
  }

  /** 複雑旅程空席照会リクエスト用のitinerariesリストを作成
   * @param itineraries:空itinerariesリスト
   * @param mergedBoundList:マージ処理済みの複雑旅程情報
   * @returns Array<RoundtripOwdRequestItinerariesInner>　作成したitinerariesリスト
   */
  private buildOnewayOrMultiCityItineraries(
    itineraries: Array<RoundtripOwdRequestItinerariesInner>,
    mergedBoundList: Array<Bound>
  ): Array<RoundtripOwdRequestItinerariesInner> {
    for (const bound of mergedBoundList) {
      // 出発時間帯の値変換
      let departureTimeWindowTo: string | undefined = undefined;
      let departureTimeWindowFrom: string | undefined = undefined;
      if (
        bound.departureTimeWindowFrom !== SearchFlightConstant.TIME_WINDOW_MIN ||
        bound.departureTimeWindowTo !== SearchFlightConstant.TIME_WINDOW_MAX
      ) {
        departureTimeWindowFrom = this.formatDepartureTimeForAPI(bound.departureTimeWindowFrom!);
        departureTimeWindowTo = this.formatDepartureTimeForAPI(bound.departureTimeWindowTo!);
      }
      itineraries.push({
        // 出発地
        originLocationCode: bound.originLocationCode!,
        // 到着地
        destinationLocationCode: bound.destinationLocationCode!,
        // 出発日
        departureDate: this.convertDateToFormatDateString(bound.departureDate),
        // 出発時間帯開始
        departureTimeWindowFrom: departureTimeWindowFrom,
        // 出発時間帯終了
        departureTimeWindowTo: departureTimeWindowTo,
        // 乗継情報
        connection: this._shoppingLibService.isNotEmpty(bound.connectionLocationCode!)
          ? {
              // 乗継地
              locationCodes: [bound.connectionLocationCode!],
              time: undefined,
            }
          : undefined,
      });
    }
    return itineraries;
  }

  /** 空席照会リクエスト用検索条件を作成
   * @param itineraries:作成したitineraries
   * @param searchFlightData:保存された検査条件
   * @returns SearchFlightConditionForRequestState　作成した空席照会リクエスト用検索条件
   */
  private buildNextScreenRequest(
    itineraries: Array<RoundtripOwdRequestItinerariesInner>,
    searchFlightData: SearchFlightState,
    data: {
      isJapanOnlyFlag: boolean;
      dcsMigrationDateStatus: string;
    }
  ): SearchFlightConditionForRequestState {
    const { isJapanOnlyFlag, dcsMigrationDateStatus } = data;
    // ユーザ共通.POS国コードを取得する
    const posCountryCode = this._aswContextStoreSvc.aswContextData.posCountryCode;
    let nextPage = '';
    if (itineraries.length >= 3 && searchFlightData.displayInformation.compareFaresNearbyDates) {
      nextPage = RoutesResRoutes.COMPLEX_FLIGHT_CALENDAR;
    } else if (itineraries.length < 3) {
      nextPage = RoutesResRoutes.ROUNDTRIP_FLIGHT_AVAILABILITY_DOMESTIC;
    } else {
      nextPage = RoutesResRoutes.COMPLEX_FLIGHT_AVAILABILITY;
    }
    //DCS移行開始後国内旅程フラグ
    const isJapanOnlyAfterDcsMigrationDate =
      isJapanOnlyFlag && (posCountryCode === 'JP' || (posCountryCode !== 'JP' && dcsMigrationDateStatus === 'After'));
    const isMixedCabin = itineraries.length === 1 ? false : searchFlightData.fare.isMixedCabin;
    let fareOptionType = undefined;
    if (!isMixedCabin) {
      if (this._shoppingLibService.isNotEmpty(searchFlightData.fare.fareOptionType)) {
        fareOptionType = searchFlightData.fare.fareOptionType;
      } else {
        fareOptionType = SearchFlightConstant.UNSPECIFIED_FARE_OPTION;
      }
    }
    //リクエストパラメータを作成する
    const request = {
      itineraries: itineraries,
      // 搭乗者数
      travelers: {
        // 大人人数
        ADT: searchFlightData.traveler.adt,
        // ヤングアダルト人数
        // DCS移行開始後国内旅程の場合は0、それ以外の場合は保持している検索条件.搭乗者数.ヤングアダルト人数
        B15: 0,
        // 小児人数
        CHD: searchFlightData.traveler.chd,
        // 幼児人数
        INF: searchFlightData.traveler.inf,
      },
      //別予約同行者有無
      hasAccompaniedInAnotherReservation:
        searchFlightData.hasAccompaniedInAnotherReservation !== null
          ? searchFlightData.hasAccompaniedInAnotherReservation
          : undefined,
      // 運賃情報
      fare: {
        // MixedCabin利用有無
        isMixedCabin: isMixedCabin,
        // キャビンクラス指定
        cabinClass: !isMixedCabin ? searchFlightData.fare.cabinClass : undefined,
        // 運賃オプション
        fareOptionType: fareOptionType,
        mixedCabinClasses: isMixedCabin
          ? {
              // キャビンクラス指定
              departureCabinClass: searchFlightData.fare.cabinClass,
              // 復路キャビンクラス指定
              returnCabinClass: searchFlightData.fare.returnCabinClass,
            }
          : undefined,
      },
      // プロモーション情報
      promotion: {
        // プロモーションコード
        code: '',
      },
      searchPreferences: {
        getAirCalendarOnly: false,
        getLatestOperation: true,
      },
      displayInformation: {
        // 画像認証後の遷移先画面URL
        nextPage: nextPage,
      },
      // 検索フォームより遷移を値trueとして保持する
      searchFormFlg: true,
    };
    //空席照会リクエスト用検索条件を設定する
    const searchFlightForRequest: SearchFlightConditionForRequestState = {
      requestIds: [],
      request: request,
    };
    return searchFlightForRequest;
  }

  /** INTERNAL_DESIGN_EVENT 出発地値変更時処理 到着地値変更時処理 往路乗継地値変更時処理 復路乗継地値変更時処理 (空港選択部品変更時処理として変更処理を統合) */
  public changeAirport(airport?: Airport) {
    //出発地・到着地の日本国内単独旅程判定
    const japanOnlyTrip = this.checkOnlyJapan(this.searchFlightData);
    const posCountryCode = this._aswContextStoreSvc.aswContextData.posCountryCode;
    const dcsMigrationDateStatus = this._shoppingLibService.getDcsMigrationDateStatus(this.searchFlightData);
    let state: SearchFlightState = { ...this.searchFlightData };
    // 搭乗者人数上限変更案内処理
    state = this.handlePassengerAgeChange(state, dcsMigrationDateStatus);
    // 搭乗者人数上限変更案内処理
    this.handlePassengerLimitChange(state, dcsMigrationDateStatus, posCountryCode);
    // 国内際切り替えした場合
    if (this._prevJapanOnlyTrip !== japanOnlyTrip) {
      const cabinClassOptions = this._shoppingLibService.getCabinList(japanOnlyTrip);
      // キャビンクラスに設定された値が選択肢に存在しない場合、再設定する
      if (cabinClassOptions.length !== 0) {
        if (cabinClassOptions.filter((v) => v.value === state.fare.cabinClass).length === 0) {
          state = {
            ...state,
            fare: {
              ...state.fare,
              cabinClass: cabinClassOptions[0].value,
            },
          };
        }
        if (state.fare.isMixedCabin) {
          // 復路キャビンクラスに設定された値が選択肢に存在しない場合、再設定する
          if (cabinClassOptions.filter((v) => v.value === state.fare.returnCabinClass).length === 0) {
            state = {
              ...state,
              fare: {
                ...state.fare,
                returnCabinClass: cabinClassOptions[0].value,
              },
            };
          }
        }
      }
      // 運賃オプションに設定された値が選択肢に存在しない場合、再設定する
      const fareTypeOptionList = this._fareTypeSelectorModalService.createFareTypeOptionList(
        state.fare.cabinClass,
        japanOnlyTrip
      );
      if (fareTypeOptionList.length !== 0) {
        if (fareTypeOptionList.filter((v) => v.value === state.fare.fareOptionType).length === 0) {
          state = {
            ...this.searchFlightData,
            fare: {
              ...this.searchFlightData.fare,
              fareOptionType: fareTypeOptionList[0].value,
            },
          };
        }
      }
    }
    state = {
      ...state,
      isJapanOnly: japanOnlyTrip,
    };
    // Mixed Cabin利用可否判定・リセット
    state = this._shoppingLibService.checkMixCabinAndReset(state);
    this._prevJapanOnlyTrip = japanOnlyTrip;
    this._searchFlightStoreService.updateStore(state);

    this.oldDomesticAswSearchFlag = this._shoppingLibService.getOldDomesticAswSearchFlag(
      this.searchFlightData,
      posCountryCode
    );
  }

  changeOptionOpen(event: boolean) {
    this.changeOptionOpenEvent.emit(event);
  }

  /** 時間数(HH)⇒分数(mins)の数値に変換
   * @param value:number(HH)
   * @returns number | null 処理に失敗の場合nullを返す
   */
  public convertHourToMins(value: number | string | undefined): number {
    const hh = Number(value);
    if (hh === 24) {
      return SearchFlightConstant.TIME_WINDOW_MAX;
    } else {
      return 60 * hh;
    }
  }

  public getOldDomesticAvailableUrl() {
    // ユーザ共通情報（AswContext）に保存された言語情報を取得
    return this._aswMasterSvc.getMPropertyByKey('search', 'url.oldDomesticSearchResult');
  }

  /**
   * 旧国内ASWの空席照会結果画面へ遷移
   */
  public navigateToOldDomesticSearchResult(
    japanOnlyFlag: boolean,
    dcsMigrationDateStatus: string,
    itineraries: Array<RoundtripOwdRequestItinerariesInner>
  ): boolean {
    // 旧国内ASW取扱検索条件フラグを初期値false
    let oldDomesticAswSearchFlag = false;
    // ユーザ共通.POS国コードを取得する
    const posCountryCode = this._aswContextStoreSvc.aswContextData.posCountryCode;
    if (posCountryCode === 'JP' && japanOnlyFlag && dcsMigrationDateStatus === 'Before') {
      oldDomesticAswSearchFlag = true;
    }
    if (oldDomesticAswSearchFlag) {
      //フォームを作成しsubmitするデータを子要素に追加する
      const anaBizLoginStatus = this._common.aswContextStoreService.aswContextData.anaBizLoginStatus;
      const form = document.createElement('form');
      // 国内空席照会結果画面URLを取得する
      form.action = this.getOldDomesticAvailableUrl();
      form.method = 'get';
      form.target = '_self';
      form.style.display = 'none';
      const firstItineraries = itineraries[0];
      const anaBizAccessToken = localStorage.getItem('encryptedAnaBizAccessToken') || '';
      let inputDataList: inputData[] = [
        {
          name: 'LANG',
          value: this._aswContextStoreSvc.aswContextData.lang === 'ja' ? 'ja' : 'en',
        },
        {
          name: 'departureAirport',
          value:
            firstItineraries.originLocationCode.length >= 4
              ? firstItineraries.originLocationCode?.slice(0, 3)
              : firstItineraries.originLocationCode,
        },
        {
          name: 'arrivalAirport',
          value:
            firstItineraries.destinationLocationCode.length >= 4
              ? firstItineraries.destinationLocationCode?.slice(0, 3)
              : firstItineraries.destinationLocationCode,
        },
        {
          name: 'outboundBoardingDate',
          value: this._datePipe.transform(firstItineraries.departureDate, 'yyyyMMdd') ?? '',
        },
        {
          name: 'inboundBoardingDate',
          value:
            itineraries.length === 2 ? this._datePipe.transform(itineraries[1].departureDate, 'yyyyMMdd') ?? '' : '',
        },
        {
          /** 大人人数 */
          name: 'adultCount',
          value: this.searchFlightData.traveler.adt.toString(),
        },
        {
          /** 小児人数 */
          name: 'childCount',
          value: this.searchFlightData.traveler.chd.toString(),
        },
        {
          /** 幼児人数 */
          name: 'infantCount',
          value: this.searchFlightData.traveler.inf.toString(),
        },
        {
          name: 'compartmentClass',
          value:
            this.searchFlightData.fare.cabinClass === 'eco'
              ? 'Y'
              : this.searchFlightData.fare.cabinClass === 'first'
              ? 'S'
              : '',
        },
        {
          name: 'roundFlag',
          value: itineraries.length === 1 ? '0' : '1',
        },
        {
          name: 'searchMode',
          value: this.searchFlightData.displayInformation.compareFaresNearbyDates ? '1' : '0',
        },
        {
          name: 'anaBizAccessToken',
          value: anaBizLoginStatus === AnaBizLoginStatusType.LOGIN ? anaBizAccessToken : '',
        },
      ];

      for (const data of inputDataList) {
        const input = document.createElement('input');
        input.setAttribute('type', 'hidden');
        input.setAttribute('name', data.name);
        input.setAttribute('value', data.value);
        form.appendChild(input);
      }

      //body部にformを追加する
      document.body.appendChild(form);
      //submitの実行
      form.submit();
      //body部にformを削除する
      document.body.removeChild(form);
    }
    return oldDomesticAswSearchFlag;
  }

  public checkOnlyJapan(state: SearchFlightState): boolean {
    let preRoundTrip: RoundTrip | undefined;
    let preOnewayOrMulticity: Array<onewayOrMulticity> | undefined;
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
    // return this._shoppingLibService.checkJapanOnlyTrip(preRoundTrip, preOnewayOrMulticity);
    return true;
  }

  /** 小児および幼児の搭乗者指定条件切替処理 */
  private handlePassengerAgeChange(
    searchFlightData: SearchFlightState,
    dcsMigrationDateStatus: string
  ): SearchFlightState {
    let state: SearchFlightState = { ...searchFlightData };
    const isOnlyJapan = this.checkOnlyJapan(state);
    if (state.traveler.chd >= 1 || state.traveler.inf >= 1) {
      if (
        this._prevJapanOnlyTrip !== isOnlyJapan ||
        ([this._prevDcsMigrationDateStatus, dcsMigrationDateStatus].filter((v) => v === 'Before').length === 1 &&
          isOnlyJapan)
      ) {
        const haveMessage = this._common.alertMessageStoreService.getAlertInfomationMessage().some((message) => {
          return message.contentId === SearchFlightConstant.INFO_ID_MSG1029;
        });
        if (!haveMessage) {
          let msg: AlertMessageItem = {
            contentHtml: SearchFlightConstant.INFO_ID_MSG1029,
            isCloseEnable: true,
            errorMessageId: SearchFlightConstant.INFO_ID_MSG1029,
            contentId: SearchFlightConstant.INFO_ID_MSG1029,
          };
          this._common.alertMessageStoreService.setAlertInfomationMessage(msg);
        }
        //搭乗者条件切替処理を行う
        state = {
          ...state,
          traveler: {
            adt: 1,
            b15: 0,
            chd: 0,
            inf: 0,
          },
        };
        //別予約同行者有無が存在する場合
        if (this.searchFlightData.hasAccompaniedInAnotherReservation !== null) {
          state = {
            ...state,
            hasAccompaniedInAnotherReservation: null,
          };
        }
      }
    }
    return state;
  }

  /** 搭乗者人数上限変更案内処理 */
  private handlePassengerLimitChange(
    searchFlightData: SearchFlightState,
    dcsMigrationDateStatus: string,
    posCountryCode: string
  ) {
    const travelers = searchFlightData.traveler.adt + searchFlightData.traveler.b15 + searchFlightData.traveler.chd;
    const haveMessage = this._common.alertMessageStoreService.getAlertInfomationMessage().some((message) => {
      return message.contentId === SearchFlightConstant.INFO_ID_MSG1493;
    });
    if (
      travelers >= 7 &&
      posCountryCode === 'JP' &&
      dcsMigrationDateStatus === 'Before' &&
      this.checkOnlyJapan(searchFlightData)
    ) {
      if (!haveMessage) {
        let msg: AlertMessageItem = {
          // 搭乗者人数上限変更案内の採番
          contentHtml: SearchFlightConstant.INFO_ID_MSG1493,
          isCloseEnable: true,
          errorMessageId: SearchFlightConstant.INFO_ID_MSG1493,
          contentId: SearchFlightConstant.INFO_ID_MSG1493,
        };
        this._common.alertMessageStoreService.setAlertInfomationMessage(msg);
      }
    } else if (haveMessage) {
      this._common.alertMessageStoreService.removeAlertInfomationMessage(SearchFlightConstant.INFO_ID_MSG1493);
    }
  }

  /** 出発日値変更時処理 (出発日選択部品変更時処理として変更処理を統合) */
  public changeDepartureDate(date?: Date[]) {
    let state: SearchFlightState = { ...this.searchFlightData };
    const dcsMigrationDateStatus = this._shoppingLibService.getDcsMigrationDateStatus(this.searchFlightData);
    const posCountryCode = this._aswContextStoreSvc.aswContextData.posCountryCode;
    // 小児および幼児の搭乗者指定条件切替処理
    state = this.handlePassengerAgeChange(state, dcsMigrationDateStatus);
    // 搭乗者人数上限変更案内処理
    this.handlePassengerLimitChange(state, dcsMigrationDateStatus, posCountryCode);
    state = {
      ...state,
      dcsMigrationDateStatus: dcsMigrationDateStatus,
    };
    this._prevDcsMigrationDateStatus = dcsMigrationDateStatus;
    // Mixed Cabin利用可否判定・リセット
    state = this._shoppingLibService.checkMixCabinAndReset(state);
    this._searchFlightStoreService.updateStore(state);
    this.oldDomesticAswSearchFlag = this._shoppingLibService.getOldDomesticAswSearchFlag(
      this.searchFlightData,
      posCountryCode
    );
  }

  /** 旧国内条件で、複雑旅程入力チェック */
  public checkOneWayOrMulticityParam(boundList: Bound[]) {
    if (
      boundList.length === 2 &&
      (boundList[0].originLocationCode !== boundList[1].destinationLocationCode ||
        boundList[0].destinationLocationCode !== boundList[1].originLocationCode)
    ) {
      return true;
    }

    if (boundList.length >= 3) {
      return true;
    }

    return false;
  }

  /** 搭乗者数文字列判定 */
  private toTravelerNumber(param: string | number | boolean, defaultNumber: string, maxPassengersCount: number) {
    if (this._shoppingLibService.isNotEmpty(param)) {
      const traveler: number = Number(param);
      if (Number.isInteger(traveler) && traveler >= 0 && traveler <= maxPassengersCount) {
        return traveler;
      }
    }
    return Number(defaultNumber);
  }

  /** フライト検索画面再表示判定 */
  private isDisplayAgain(): boolean {
    const searchFlightConditionForRequestState = this._searchFlightConditionForRequestService.getData();
    const itineraries = searchFlightConditionForRequestState.request.itineraries;
    return itineraries.length > 0;
  }

  /** ローカルストレージフラグを読取削除処理 */
  private readAndClearStorageFlag(): boolean {
    const flag = JSON.parse(window.localStorage.getItem('planDeleted') || 'false');
    if (flag) {
      //　複数回読取防止の為ストレージフラグを削除
      window.localStorage.removeItem('planDeleted');
    }
    return flag;
  }
}
