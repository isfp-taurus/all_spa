import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { Observable, Subscription, filter, timer } from 'rxjs';

import { MasterDataService } from '../../../services';
import { TranslateService } from '@ngx-translate/core';
import { TranslatePrefix } from '@conf/index';
import { timeToMinutesFormate } from '../../../helpers';
import { FilterFlightModalService } from '../../../components/filter-flight-modal/filter-flight-modal.service';
import { SortModalService } from '../../../components/sort-modal/sort-modal.service';
import {
  BoundFilterCondition,
  FareName,
  FareOption,
  FilterConditionDomestic,
  FilterOpenParam,
  SEARCH_TYPE,
  SortOption,
  SortOrder,
  FlightSearchCondition,
  OperatingAirline,
} from '../../../interfaces';
import {
  RoundtripFppItemAirBoundDataTypeAirBoundGroupsInner,
  RoundtripFppItemAirBoundsDataType,
  RoundtripFppItemAirCalendarDataType,
  RoundtripFppItemBoundDetailsDataType,
  RoundtripFppItemFareFamilyDataTypeInner,
  RoundtripFppItemTravelSolutionsSummaryDataTypeOperatingAirlinesInner,
  RoundtripFppResponse,
} from '../../../../common/sdk';
import { AlertMessageStoreService, AswContextStoreService } from '@lib/services';
import { AlertMessageItem, AlertType, LoginStatusType } from '@lib/interfaces';
import { SearchFlightStoreService } from '@common/services';
import { SearchFlightStateDetails } from '@common/store';
import { AppConstants } from '@conf/app.constants';

/** 静的文言鍵 */
const TRANSLATE_KEY = {
  RECOMMENDED: 'label.recommendedOrder',
};

/**
 * 検索結果操作部ContComponent
 */
@Component({
  selector: 'asw-result-flight-function-cont',
  templateUrl: './result-flight-function-cont.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResultFlightFunctionContComponent implements OnInit, OnDestroy, AfterViewInit {
  public appConstants = AppConstants;

  /**
   * 往路: 初期表示時選択可能な便
   */
  @Input()
  public outSeatAvailability?: boolean;

  /**
   * 往路: 初期表示時選択可能な便
   */
  @Input()
  public returnSeatAvailability?: boolean;

  /**
   * 往路:変更旅程空席照会情報
   */
  @Input()
  public outSearchResult?: RoundtripFppResponse | null;

  /**
   * お気に入り登録済み
   */
  @Input()
  public isRegisteredFavorite?: boolean;

  /**
   * 復路:変更旅程空席照会情報
   */
  @Input()
  public returnSearchResult?: RoundtripFppResponse | null;

  /**
   * 往路:フィルター変更旅程空席照会情報
   */
  @Input()
  public outFilterSearchResult?: Array<RoundtripFppItemAirBoundDataTypeAirBoundGroupsInner>;

  /**
   * 復路:フィルター変更旅程空席照会情報
   */
  @Input()
  public returnFilterSearchResult?: Array<RoundtripFppItemAirBoundDataTypeAirBoundGroupsInner>;

  /**
   * 往路:FareFamily ヘッダ
   */
  @Input()
  public outFareFamilies?: Array<RoundtripFppItemFareFamilyDataTypeInner>;

  /**
   * 復路:7日間空席照会結果
   */
  @Input()
  public returnFareFamilies?: Array<RoundtripFppItemFareFamilyDataTypeInner>;

  /**
   * 検索条件
   */
  @Input()
  public searchCondition?: FlightSearchCondition;

  /**
   * 往路:7日間空席照会結果
   */
  @Input()
  public outAirCalendar?: RoundtripFppItemAirCalendarDataType;

  /**
   * 復路:出発日
   */
  @Input()
  public returnDepartureDate?: string;

  /**
   * 往路:出発日
   */
  @Input()
  public outDepartureDate?: string;

  /**
   * 選択した往路Travel Solution情報
   */
  @Input()
  public outSelectedTS?: RoundtripFppItemBoundDetailsDataType | null;

  /**
   * 往路:プロモーションが存在する検索結果リスト(FF選択モーダルで使用される)
   */
  @Input()
  public outHasPromotionsResult?: boolean;

  /**
   * 復路:プロモーションが存在する検索結果リスト(FF選択モーダルで使用される)
   */
  @Input()
  public returnHasPromotionsResult?: boolean;

  /**
   * 検索結果操作部.運賃オプション切替ボタン表示条件
   */
  @Input()
  public isFareOptionDisplay?: boolean;

  /**
   * フィルタ条件表示ボタン押下
   */
  @Input()
  public filterClick$?: Observable<boolean>;

  /**
   * ソート条件表示ボタン押下
   */
  @Input()
  public sortClick$?: Observable<boolean>;

  /**
   * 現在表示されている並べ替え順序
   */
  @Input()
  public currentSortOrder?: SortOrder;

  /**
   * 往路:選択中状態
   *
   * unSelected: 未選択
   * selected: 選択済み
   */
  @Input()
  public outStatus?: 'unSelected' | 'selected';

  /**
   * 復路:選択中状態
   *
   * unSelected: 未選択
   * selected: 選択済み
   */
  @Input()
  public returnStatus?: 'unSelected' | 'selected';

  /**
   * 並べ替えボタンのラベル
   */
  public sortButtonLabel?: string;

  @Input()
  public filterConditionInit$?: Observable<SEARCH_TYPE>;

  /**
   * フィルタ条件適用
   */
  @Output()
  public filterApply$: EventEmitter<{ condition?: FilterConditionDomestic; isInit?: boolean }> = new EventEmitter<{
    condition?: FilterConditionDomestic;
    isInit?: boolean;
  }>();

  /**
   * ソート条件適用
   */
  @Output()
  public sortApply$: EventEmitter<SortOrder> = new EventEmitter<SortOrder>();

  /**
   * ャビンクラス適用
   */
  @Output()
  public cabinClassApply$: EventEmitter<string> = new EventEmitter<string>();

  /**
   * キャビンクラス切替
   */
  @Output()
  public changeCabin$: EventEmitter<string> = new EventEmitter<string>();

  /**
   * お気に入り追加
   */
  @Output()
  public addToFavorite$: EventEmitter<void> = new EventEmitter<void>();

  /**
   * フィルタ条件
   */
  public filterCondition?: FilterConditionDomestic;

  /**
   * 初期フィルタ条件
   */
  public filterConditionInitData?: FilterConditionDomestic;

  /**
   * 最後に適用されたフィルタ条件
   */
  public savedFilterCondition?: FilterConditionDomestic;

  /**
   * 総差額 表示条件
   */
  public isDifferVisible: boolean = false;

  /**
   * プロモーション適用Air Offerのみ
   */
  public isPromotionVisible: boolean = false;

  /**
   * 7日間空席照会結果
   */
  public airCalendarInfo?: RoundtripFppItemAirCalendarDataType;

  /**
   * 復路出発日カレンダー
   */
  public returnDepartureDateCalendar?: string;

  /**
   * 往路出発日カレンダー
   */
  public outDepartureDateCalendar?: string;

  /**
   * 更新可能なキャビンクラス
   */
  public upgradableCabins: Array<string> = [];

  /**
   * 運賃オプション
   */
  public fareOptions: Array<FareOption> = [];

  /**
   * キャビンクラス
   */
  public domesticCabin: Array<string> = [];

  public fareNames: Array<FareName> = [];

  /**
   * ログインステータス≠未ログイン
   */
  public isNotLogin?: boolean;

  /**
   * ngOnDestroyにunsubscribeを実行
   */
  private _subscriptions: Subscription = new Subscription();

  /**
   * フィルタ条件モーダルを表示フラグ
   */
  private _isFilterModalOpened = false;

  private _initFlag = true;

  /**
   * 履歴用検索条件
   */
  private _searchFlight: SearchFlightStateDetails;

  constructor(
    private _filterModalSvc: FilterFlightModalService,
    private _sortModalSvc: SortModalService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _translateSvc: TranslateService,
    private _aswContextSvc: AswContextStoreService,
    private _masterDataService: MasterDataService,
    private _searchFlightSvc: SearchFlightStoreService,
    private _alertMsgSvc: AlertMessageStoreService
  ) {
    // 履歴用検索条件
    this._searchFlight = this._searchFlightSvc.getData();
  }

  /**
   * 初期化処理
   */
  public ngOnInit() {
    this.sortButtonLabel = TRANSLATE_KEY.RECOMMENDED;
    this.isNotLogin = this._aswContextSvc.aswContextData.loginStatus !== LoginStatusType.NOT_LOGIN;
    this.fareOptions = this._getFareOptionCheckList();
    this.filterConditionInit$?.pipe(filter((searchType) => !!searchType)).subscribe(() => {
      timer(0).subscribe(() => {
        this._filterConditionInit();
        this.filterApply$.emit({ condition: this.filterCondition, isInit: true });
      });
    });
  }

  public ngAfterViewInit() {
    this.filterClick$?.pipe(filter((filterClick) => filterClick)).subscribe(() => {
      this.openFilter();
    });
    this.sortClick$?.pipe(filter((sortClick) => sortClick)).subscribe(() => {
      this.openSort();
    });
  }

  /**
   * フィルタ条件表示ボタン押下処理
   */
  public openFilter() {
    if (!this.filterCondition) {
      this._filterConditionInit();
    }
    if (this.filterCondition && this.filterConditionInitData) {
      const ref = this._filterModalSvc.open(this._getFilterParam());
      this._subscriptions.add(
        ref.applyButtonClick$.subscribe((filterCondition: FilterConditionDomestic) => {
          let outConnectionsChange = false;
          let returnConnectionsChange = false;
          if (!this.savedFilterCondition) {
            this.savedFilterCondition = JSON.parse(JSON.stringify(this.filterCondition));
          }
          if (this.savedFilterCondition?.outBound && this.savedFilterCondition?.outBound?.connections.length > 0) {
            outConnectionsChange =
              JSON.stringify(this.savedFilterCondition?.outBound?.connections) !==
              JSON.stringify(filterCondition?.outBound?.connections);
          }
          if (
            this.savedFilterCondition?.returnBound &&
            this.savedFilterCondition?.returnBound?.connections.length > 0
          ) {
            returnConnectionsChange =
              JSON.stringify(this.savedFilterCondition?.returnBound?.connections) !==
              JSON.stringify(filterCondition?.returnBound?.connections);
          }
          // フィルタ条件の選択内容を保存する
          this.savedFilterCondition = JSON.parse(JSON.stringify(filterCondition));
          this.filterCondition = JSON.parse(JSON.stringify(filterCondition));
          this.filterApply$.emit({
            condition: {
              ...this.filterCondition!,
              ...{ outConnectionsChange: outConnectionsChange, returnConnectionsChange: returnConnectionsChange },
            },
            isInit: false,
          });
          this._isFilterModalOpened = true;
          ref.close();
        })
      );
    }
  }

  /**
   * ソート条件表示ボタン押下処理
   */
  public openSort() {
    if (!this.currentSortOrder || this._isFilterModalOpened) {
      this.currentSortOrder = SortOrder.RECCOMENDED;
    }
    // 条件適用後に再度フィルタ条件モーダルを表示する場合は、前回適用時の状態を維持する。
    this._isFilterModalOpened = false;
    const ref = this._sortModalSvc.open(this.currentSortOrder);
    this._subscriptions.add(
      ref.sortButtonClick$.subscribe((sortOption: SortOption) => {
        this.currentSortOrder = sortOption.sortOrder;
        this.sortButtonLabel = sortOption.sortName;
        this.sortApply$.emit(sortOption.sortOrder);
        this._changeDetectorRef.markForCheck();
        ref.close();
      })
    );
  }

  /**
   * キャビンクラス切替ボタン押下処理
   * @param cabin 選択したキャビンクラス
   */
  public changeCabin(cabin: string) {
    this.changeCabin$.emit(cabin);
  }

  /**
   * お気に入り追加ボタン押下処理
   */
  public addToFavorite() {
    this.addToFavorite$.emit();
  }

  /**
   * 現在表示されている運賃オプションタイプ
   * @returns
   */
  public get currentFareOption(): string {
    return this.searchCondition?.fare.fareOptionType || '';
  }

  /**
   * 運賃ボタンのラベル
   * @returns
   */
  public get fareButtonLabel(): string {
    return this._translateSvc.instant(`${TranslatePrefix.LIST_DATA}PD_940_${this.currentFareOption}`);
  }

  /**
   * フィルタ条件初期化
   */
  private _filterConditionInit(searchType?: SEARCH_TYPE) {
    /**
     * 以下の処理にて、アプリケーション情報.フィルタ条件を設定する。
     * 以下の処理にて、総差額レンジスライダーの最小値と最大値を設定する。
     * アプリケーション情報.総差額リストを作成する。
     */
    let totalDifferList: Array<number> = [];
    this._setCommonList(totalDifferList);
    let filterCondition: any = {
      seatAvailability:
        searchType === SEARCH_TYPE.RETURN_CALENDAR
          ? true
          : ((this.outSeatAvailability || this.returnSeatAvailability) as boolean),
      priceMin: totalDifferList[0],
      priceMax: totalDifferList[totalDifferList.length - 1 < 0 ? 0 : totalDifferList.length - 1],
      priceFrom: totalDifferList[0],
      priceTo: totalDifferList[totalDifferList.length - 1 < 0 ? 0 : totalDifferList.length - 1],
      fareOptions: {
        fareOptionType: '0',
        fareOptionMap: this._getFareOptionCheckList(),
        fareNameMap: this._getFareNameMap(),
      },
      promotion: false,
      outBound: this._filterBoundInit(this.outSearchResult),
      returnBound: this._filterBoundInit(this.returnSearchResult),
    };
    this.filterCondition = filterCondition;
    // filterCondition を filterConditionInit にコピーします
    this.filterConditionInitData = JSON.parse(JSON.stringify(this.filterCondition));
  }

  /** 運賃名称リストを取得する */
  private _getFareNameMap() {
    let airBoundExchangeGroups;
    let fareFamilies;
    if (this.outSearchResult && this.returnSearchResult) {
      airBoundExchangeGroups = [
        ...this.outSearchResult.data.airBound.airBoundGroups,
        ...this.returnSearchResult.data.airBound.airBoundGroups,
      ];
    } else {
      airBoundExchangeGroups =
        this.outSearchResult?.data.airBound.airBoundGroups || this.returnSearchResult?.data.airBound.airBoundGroups;
    }
    if (this.outFareFamilies && this.returnFareFamilies) {
      fareFamilies = [...this.outFareFamilies, ...this.returnFareFamilies];
    } else {
      fareFamilies = this.outFareFamilies || this.returnFareFamilies;
    }
    return this._masterDataService.getFareNameList(airBoundExchangeGroups, fareFamilies);
  }

  /**
   * 運賃タイプチェックボックスリストを作成する
   * @param upgradableCabins 更新可能なキャビンクラス
   * @returns 運賃タイプチェックボックスリスト
   */
  private _getFareOptionCheckList(): Array<FareOption> {
    let fareCheckList: Array<FareOption> = [
      // 無料で変更可
      {
        fareOptionCode: '0',
        fareOptionName: 'label.itineraryPermitted',
        value: false,
      },
      // 有料で変更可
      {
        fareOptionCode: '1',
        fareOptionName: 'label.itineraryPermittedWithFee',
        value: false,
      },
      // 無料で払戻可
      {
        fareOptionCode: '2',
        fareOptionName: 'label.refundPermitted',
        value: false,
      },
      // 有料で払戻可
      {
        fareOptionCode: '3',
        fareOptionName: 'label.refundPermittedWithFee',
        value: false,
      },
    ];

    return fareCheckList;
  }
  /**
   * 総差額リストと無料預け入れ手荷物許容量チェックボックスリストを設定する。
   * @param totalDifferList 総差額リスト
   * @param baggageAllowances 無料預け入れ手荷物許容量
   */
  private _setCommonList(totalDifferList: Array<number>) {
    const airBoundExchangeGroups = this.returnFilterSearchResult || this.outFilterSearchResult;
    const fareFamilies = this.returnFareFamilies || this.outFareFamilies;
    const displayedTotalPrice = this._searchFlight.lowestPrice.displayedTotalPrice;
    const displayedBasePrice = this._searchFlight.lowestPrice.displayedBasePrice;
    if (airBoundExchangeGroups && fareFamilies && airBoundExchangeGroups.length > 0 && fareFamilies.length > 0) {
      const fareFamilyArr = fareFamilies.map((fareFamily) => fareFamily.fareFamilyCode);
      let hasW0831 = false;
      let hasW0832 = false;
      const alertWarningMsg = this._alertMsgSvc.getAlertWarningMessage();
      alertWarningMsg.forEach((v) => {
        if (v.contentId === 'W0831') {
          hasW0831 = true;
        } else if (v.contentId === 'W0832') {
          hasW0832 = true;
        }
      });
      let viewW0831 = false;
      let viewW0832 = false;
      airBoundExchangeGroups.forEach((airBoundInfo) => {
        fareFamilyArr.forEach((fareFamily) => {
          // アプリケーション情報.総差額リストにAir Bound情報.airBound.prices.totalPrice.price.totalを追加する。
          if (
            (airBoundInfo[fareFamily] as RoundtripFppItemAirBoundsDataType)?.airBound?.prices.totalPrice.price.total ||
            (airBoundInfo[fareFamily] as RoundtripFppItemAirBoundsDataType)?.airBound?.prices.totalPrice.price.total ===
              0
          ) {
            totalDifferList.push(
              (airBoundInfo[fareFamily] as RoundtripFppItemAirBoundsDataType)?.airBound?.prices.totalPrice.price
                .total as number
            );
          }
          // Air Bound情報.airBound.prices.isCheapest＝trueの場合、以下のいずれかに一致する場合はワーニングメッセージを設定する
          const prices = (airBoundInfo[fareFamily] as RoundtripFppItemAirBoundsDataType)?.airBound?.prices;
          if (
            prices?.isCheapest &&
            displayedTotalPrice !== null &&
            displayedTotalPrice !== undefined &&
            displayedBasePrice !== null &&
            displayedBasePrice !== undefined
          ) {
            // Air Bound情報.airBound.prices.isCheapest＝trueの場合、以下のいずれかに一致する場合はワーニングメッセージを設定する。
            const price = prices.totalPrice.price;
            const totalValue = price.total;
            const baseValue = price.base;
            if (totalValue > displayedTotalPrice || baseValue > displayedBasePrice) {
              viewW0831 = true;
              if (!hasW0831) {
                hasW0831 = true;
                const alertMessageData: AlertMessageItem = {
                  contentHtml: 'm_error_message-W0831',
                  contentId: 'W0831',
                  isCloseEnable: true,
                  alertType: AlertType.WARNING,
                  errorMessageId: 'W0831',
                };
                this._alertMsgSvc.setAlertWarningMessage(alertMessageData);
              }
            }
            if (totalValue < displayedTotalPrice || baseValue < displayedBasePrice) {
              viewW0832 = true;
              if (!hasW0832) {
                hasW0832 = true;
                const alertMessageData: AlertMessageItem = {
                  contentHtml: 'm_error_message-W0832',
                  contentId: 'W0832',
                  isCloseEnable: true,
                  alertType: AlertType.WARNING,
                  errorMessageId: 'W0832',
                };
                this._alertMsgSvc.setAlertWarningMessage(alertMessageData);
              }
            }
          }
        });
      });
      if (hasW0831 && !viewW0831) {
        this._alertMsgSvc.removeAlertWarningMessage('W0831');
      }
      if (hasW0832 && !viewW0832) {
        this._alertMsgSvc.removeAlertWarningMessage('W0832');
      }
      // アプリケーション情報.総差額リストを総差額の昇順でソートする。(ソート処理にはJavaScriptのソート関数を使用する。)
      totalDifferList.sort((first: number, second: number) => {
        return first - second;
      });
    }
  }

  /**
   * フィルタバウンド情報初期化
   * @param searchResult 検索結果
   * @returns
   */
  private _filterBoundInit(searchResult: RoundtripFppResponse | null | undefined): BoundFilterCondition | null {
    if (searchResult && searchResult.data.airBound.travelSolutionsSummary) {
      const travelSolutionsSummary = searchResult.data.airBound.travelSolutionsSummary;
      let operatingAirlines = travelSolutionsSummary.operatingAirlines;

      operatingAirlines = [
        operatingAirlines.find(
          (operatingAirline) => operatingAirline.airlineCode === this.appConstants.CARRIER.TWO_LETTER
        ),
        ...operatingAirlines.filter(
          (operatingAirline) => operatingAirline.airlineCode !== this.appConstants.CARRIER.TWO_LETTER
        ),
      ].filter(Boolean) as RoundtripFppItemTravelSolutionsSummaryDataTypeOperatingAirlinesInner[];

      return {
        // 乗継回数
        numberOfConnection: travelSolutionsSummary.numbersOfConnections.map((numbersOfConnection) => {
          return {
            connectionNumber: String(numbersOfConnection),
            value: false,
          };
        }),
        // 最小所要時間
        durationMin: travelSolutionsSummary.minDuration / 60,
        // 最大所要時間
        durationMax: travelSolutionsSummary.maxDuration / 60,
        // 所要時間 From
        durationFrom: travelSolutionsSummary.minDuration / 60,
        // 所要時間 To
        durationTo: travelSolutionsSummary.maxDuration / 60,
        // 出発空港
        originLocation: travelSolutionsSummary.originDepartures.map((originDeparture) => {
          return {
            code: originDeparture.locationCode,
            name: { locationCode: originDeparture.locationCode, locationName: originDeparture.locationName },
            value: false,
          };
        }),
        // 最小出発時刻 From
        originTimeMin: this._getTimeValue('from', 0),
        // 最大出発時刻 To
        originTimeMax: this._getTimeValue('to', 23 * 60 + 59),
        // 出発時刻 From
        originTimeFrom: this._getTimeValue('from', 0),
        // 出発時刻 To
        originTimeTo: this._getTimeValue('to', 23 * 60 + 59),
        // 到着空港
        arrivalLocation: travelSolutionsSummary.destinationArrivals.map((destinationArrival) => {
          return {
            code: destinationArrival.locationCode,
            name: { locationCode: destinationArrival.locationCode, locationName: destinationArrival.locationName },
            value: false,
          };
        }),
        // 最小到着時刻
        arrivalTimeMin: 0,
        // 最大到着時刻
        arrivalTimeMax: 23 * 60 + 59,
        // 到着時刻 From
        arrivalTimeFrom: 0,
        // 到着時刻 To
        arrivalTimeTo: 23 * 60 + 59,
        // 乗継空港
        connections: travelSolutionsSummary.connections.map((connection) => {
          return {
            ...connection,
            locationCode: connection.locationCode,
            locationName: connection.locationName,
            value: false,
          };
        }),
        // 最小乗継時間
        connectionTimeMin: 0,
        // 最大乗継時間
        connectionTimeMax: 16.5 * 60,
        // 乗継時間
        connectionTime: 0,
        // 運航キャリア
        operatingAirlines: operatingAirlines
          .filter((airline) => airline.airlineCode)
          .reduce((arr, current) => {
            if (!arr.find((val) => val.airlineCode === current.airlineCode)) {
              if (current.airlineCode === this.appConstants.CARRIER.TWO_LETTER) {
                arr.unshift({
                  airlineCode: this.appConstants.CARRIER.TWO_LETTER,
                  airlineName: current.airlineName,
                  value: false,
                });
              } else {
                arr.push({
                  airlineCode: current.airlineCode,
                  airlineName: current.airlineName,
                  value: false,
                });
              }
            }
            return arr;
          }, [] as Array<OperatingAirline>),
        // 機種
        aircraftCodes: travelSolutionsSummary.aircraftCodes.map((aircraftCode) => {
          return { code: aircraftCode, value: false };
        }),
        // Wi-Fiサービス
        wifiService: false,
      };
    } else {
      return null;
    }
  }

  /**
   * 日付を文字列型からスライダーに適した値に変換する。
   * @param endType 時間の始まりか、時間の終わりか
   * @param defaultTime デフォルト時間
   * @returns
   */
  private _getTimeValue(endType: 'from' | 'to', defaultTime: number): number {
    if (this.searchCondition && this.searchCondition.itineraries && this.searchCondition.itineraries.length > 0) {
      let date = null;
      /**
       * アプリケーション情報.検索条件.区間毎の情報[0].出発時刻From≠””(空欄)の場合、アプリケーション情報.検索条件.区間毎の情報[0].出発時刻From
       * アプリケーション情報.検索条件.区間毎の情報[0].出発時刻To≠””(空欄)の場合、アプリケーション情報.検索条件.区間毎の情報[0].出発時刻To
       */
      const caseFrom = endType === 'from' && this.searchCondition.itineraries[0].departureTimeWindowFrom;
      const caseTo = endType === 'to' && this.searchCondition.itineraries[0].departureTimeWindowTo;
      if (caseFrom) {
        date = timeToMinutesFormate(caseFrom);
      } else if (caseTo) {
        date = timeToMinutesFormate(caseTo);
      }
      return date ? date : defaultTime;
    }
    // 上記以外の場合
    return defaultTime;
  }

  /**
   * フィルタパラメータ取得
   * @returns
   */
  private _getFilterParam(): FilterOpenParam {
    if (this.searchCondition && this.searchCondition?.itineraries) {
      /**
       * 以下をすべて満たす場合、表示
       * a.	アプリケーション情報.プロモーションが存在する検索結果リスト=true (プロモーションが存在する)
       */
      if (this.outHasPromotionsResult || (this.returnHasPromotionsResult && this.outSelectedTS)) {
        this.isPromotionVisible = true;
      } else {
        this.isPromotionVisible = false;
      }
    }
    return {
      filterCondition: this.filterCondition,
      filterConditionInitData: this.filterConditionInitData,
      isPromotionVisible: this.isPromotionVisible,
      isReturnVisible: this.searchCondition?.itineraries.length === 2 && this.returnSearchResult,
    } as FilterOpenParam;
  }

  public ngOnDestroy(): void {
    this._subscriptions.unsubscribe();
  }
}
