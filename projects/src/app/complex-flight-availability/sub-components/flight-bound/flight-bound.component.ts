import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { SupportComponent } from '@lib/components/support-class';
import { AswMasterService, CommonLibService } from '@lib/services';
import { FindMoreFlightsRequest } from 'src/sdk-search/model/findMoreFlightsRequest';
import {
  ComplexFmfFareFamily,
  ComplexFmfFareFamilyAirOffersInnerComplexBoundsInner,
  ComplexFmfFareFamilyAirOffersInnerComplexBoundsInnerAircraftConfigurationVersionsInner,
  ComplexItinerary,
  ComplexRequest,
  ComplexResponse,
} from 'src/sdk-search';
import { Bound } from 'src/sdk-search/model/bound';
import { MASTER_TABLE } from '@conf/asw-master.config';
import { DatePipe } from '@angular/common';
import { OperatingAirlineInfo, SearchForAirportCodeCache, SearchForAirportCodeList } from './flight-bound.state';
import { RoutesResRoutes } from '@conf/routes.config';
import { Router } from '@angular/router';
import { SearchFlightStoreService } from '@common/services/store/search-flight/search-flight-store/search-flight-store.service';
import { fetchComplexRequestData } from '@app/complex-flight-availability/helper/data';
import { FlightPlanService } from '@common/components/shopping/flight-plan/flight-plan.service';
import { ComplexFlightAvailabilityStoreService } from '@app/complex-flight-availability/service/store.service';
import { AswContextType } from '@lib/interfaces';
import { FindMoreFlightsStoreService } from '@common/services/store/find-more-flights/find-more-flights-store/find-more-flights-store.service';
import { ComplexFlightAvailabilityTeleportService } from '@app/complex-flight-availability/service/teleport.service';
import { StaticMsgPipe } from '@lib/pipes';
import { AirportI18nJoinByAirportCodeCache } from '@common/services/shopping/shopping-lib/shopping-lib.state';
import { ShoppingLibService } from '@common/services';
import { AppConstants } from '@conf/app.constants';

@Component({
  selector: 'asw-flight-bound',
  templateUrl: './flight-bound.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlightBoundComponent extends SupportComponent {
  public requestMock?: ComplexRequest;
  public _fareFamily?: ComplexFmfFareFamily;
  public isDisplay = [];
  public originLocationName?: string;
  public m_airport_i18n = 'm_airport_i18n_' as const;
  public lang: string = '';
  public bounds: Bound[] = [];
  public isLocationDisplayList: boolean[] = [];
  public isDestinationLocationList: boolean[] = [];
  public isDepartureDateCheckList: boolean[] = [];
  public isArrivalDateCheckList: boolean[] = [];
  public durationList: string[] = [];
  public priorityCode: string = '';
  public originLocationNameList: string[] = [];
  public destinationLocationNameList: string[] = [];
  public connectionLocationNameList: string[] = [];
  public originLocationAirPortNameList: string[] = [];
  public destinationLocationAirPortNameList: string[] = [];
  /** フライト詳細ヘッダ表示要否 */
  public isShowFlightDetailHeader: boolean = false;
  public operatingAirlineList: string[] = [];
  public operatingAirlineNameList: OperatingAirlineInfo[][] = [];

  public wifiSomeAvailableAlt = 'm_static_message-alt.wifiSomeAvailable';
  /** キャリア識別アイコン */
  public appConstants = AppConstants;

  @Input()
  set fareFamily(data: ComplexFmfFareFamily | undefined) {
    this._fareFamily = data;
    this.bounds = data?.airOffers?.[0].bounds || [];
    this.priorityCode = data?.fareFamilyWithService?.priorityCode
      ? `m_ff_priority_code_i18n_${data?.fareFamilyWithService?.priorityCode}`
      : '';

    // reduce render times, better performance
    this.bounds.length && this._initData();
  }
  get fareFamily(): ComplexFmfFareFamily | undefined {
    return this._fareFamily;
  }

  @Input()
  public complexResponse?: ComplexResponse;

  @Input()
  public cabin?: string;

  @Input()
  public isPc?: boolean;

  /** フライト詳細リンクを押下時に親コンポーネントに返すイベント */
  @Output()
  public clickFlightDetailEvent = new EventEmitter<{
    event: Event;
    boundIndex: number;
  }>();

  //カウチ対象便ACVコードリスト
  public couchAcvCodeList: string[] = [];

  /** コンストラクタ */
  constructor(
    private _common: CommonLibService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _datePipe: DatePipe,
    private _router: Router,
    private _searchFlightStoreService: SearchFlightStoreService,
    private _flightPlanService: FlightPlanService,
    private _storeService: ComplexFlightAvailabilityStoreService,
    private _findMoreFlightsStoreService: FindMoreFlightsStoreService,
    private _masterSvc: AswMasterService,
    private _staticMsgPipe: StaticMsgPipe,
    private _shoppingLivService: ShoppingLibService
  ) {
    super(_common);
    this.subscribeService(
      'flight-bound-watch-asw-context-lang',
      this._common.aswContextStoreService.getAswContextByKey$(AswContextType.LANG),
      (lang) => {
        this.lang = lang;
      }
    );
  }

  /** 初期表示処理 */
  init() {
    if (this._common.aswContextStoreService.aswContextData.posCountryCode === 'MX') {
      this.couchAcvCodeList = this._shoppingLivService.getcouchAcvCodeList();
    }
  }

  /** 画面終了時処理 */
  destroy() {
    this.deleteSubscription('flight-bound-watch-asw-context-lang');
  }

  /** 画面更新時処理 */
  reload() {}

  /**
   * 初期処理
   */
  private async _initData() {
    this.setDuration();
    this.setIsDateCheck();
    this.setOperatingAirlineName();
    await this._fetchLocationDisplay();
    this._changeDetectorRef.markForCheck();
  }

  // 非同期で取得
  private async _fetchLocationDisplay() {
    const data = await fetchComplexRequestData(this._storeService);
    this.requestMock = data;
    const _searchForAirportList: SearchForAirportCodeList = await this._masterSvc.aswMaster[
      MASTER_TABLE.AIRPORT_I18N_SEARCH_FOR_AIRPORT_CODE.key
    ];
    this.setLocationName(data, _searchForAirportList);
  }

  /** 最新日時の出し分け用チェック */
  private setIsDateCheck() {
    this.isDepartureDateCheckList = [];
    this.isArrivalDateCheckList = [];
    const dateFormat = 'yyyy-MM-dd';

    this.bounds?.forEach((bound: Bound) => {
      this.isDepartureDateCheckList.push(
        this._datePipe.transform(bound.originDepartureDateTime, dateFormat) ===
          this._datePipe.transform(bound.originDepartureEstimatedDateTime, dateFormat)
      );

      this.isArrivalDateCheckList.push(
        this._datePipe.transform(bound.destinationArrivalDateTime, dateFormat) ===
          this._datePipe.transform(bound.destinationArrivalEstimatedDateTime, dateFormat)
      );
    });
  }

  /** リクエスト用検索条件から取得した空港名のリストを作成 */
  private setLocationName(complexRequest: ComplexRequest, searchForAirportList: SearchForAirportCodeList) {
    this.originLocationNameList = [];
    this.destinationLocationNameList = [];
    this.connectionLocationNameList = [];
    complexRequest.itineraries.forEach((itinerary: ComplexItinerary) => {
      const targetOriginLocationCode = itinerary.originLocationCode;
      const targetDestinationLocationCode = itinerary.destinationLocationCode;
      const targetConnectionLocationCode = itinerary.connection?.locationCode;
      searchForAirportList &&
        searchForAirportList[targetOriginLocationCode].length &&
        searchForAirportList[targetOriginLocationCode].some((searchForAirport: SearchForAirportCodeCache) => {
          this.originLocationNameList.push(
            targetOriginLocationCode === searchForAirport.search_for_airport_code ? searchForAirport.airport_name : ''
          );
        });
      searchForAirportList &&
        searchForAirportList[targetDestinationLocationCode].length &&
        searchForAirportList[targetDestinationLocationCode].some((searchForAirport: SearchForAirportCodeCache) => {
          this.destinationLocationNameList.push(
            targetDestinationLocationCode === searchForAirport.search_for_airport_code
              ? searchForAirport.airport_name
              : ''
          );
        });
      searchForAirportList &&
        targetConnectionLocationCode &&
        searchForAirportList[targetConnectionLocationCode].length &&
        searchForAirportList[targetConnectionLocationCode].some((searchForAirport: SearchForAirportCodeCache) => {
          this.connectionLocationNameList.push(
            targetConnectionLocationCode === searchForAirport.search_for_airport_code
              ? searchForAirport.airport_name
              : ''
          );
        });
    });
  }

  /** 運航キャリア名称設定 */
  private setOperatingAirlineName() {
    this.bounds?.forEach((bound: Bound, boundIndex: number) => {
      const operatingAirlineInfos = this._flightPlanService.getOperatingAirlineNameList(bound);
      this.operatingAirlineNameList[boundIndex] = [];
      operatingAirlineInfos &&
        operatingAirlineInfos.forEach((operatingAirlineInfo: string, index: number) => {
          const beforeUrlInfo = operatingAirlineInfo.split('|');
          const urlInfo: OperatingAirlineInfo = {
            url: beforeUrlInfo[0] ?? '',
            name: beforeUrlInfo[1] ?? '',
          };
          this.operatingAirlineNameList[boundIndex][index] = urlInfo;
        });
    });
    this.operatingAirlineNameList.forEach((operatingAirlineName, index) => {
      this.operatingAirlineList.push(this.createOperatingAirlineNameList(operatingAirlineName, index));
    });
  }

  /** convert処理 */
  private convertSecondToHourSecond(second: number): string {
    const hh = `${String(Math.floor(second / 3600))}`.padStart(2, '0');
    const mm = `${String(Math.floor((second % 3600) / 60))}`.padStart(2, '0');
    return `${hh}:${mm}`;
  }

  /** duration設定 */
  private setDuration() {
    this.durationList = this.bounds.map((bound: Bound) =>
      bound.duration ? this.convertSecondToHourSecond(bound.duration) : ''
    );
  }

  /**
   * おすすめ旅程のフライト詳細リンク押下
   */
  public flightDetails(event: Event, boundIndex: number) {
    event.preventDefault();
    this.isShowFlightDetailHeader = true;
    this.clickFlightDetailEvent.emit({
      event: event,
      boundIndex: boundIndex,
    });
  }

  /**
   * 「非同期」変更ボタン押下処理
   */
  public async change(event: Event, boundIndex: number) {
    event.preventDefault();
    //  当処理は呼び出し元よりバウンドインデックスを受け取り処理を行う。
    await this.updateFindMoreFlightsStore(boundIndex);

    // Find more Flights画面(R01-P034)へ遷移する。
    this._router.navigate([RoutesResRoutes.COMPLEX_MORE_FLIGHTS]);
  }

  /**
   * DCSを判断
   */
  private _checkDomesticAfterDCS() {
    // カテゴリ：UIUX移行関連からプロパティキー = ”uiuxs2.transitionDate.domesticDcs”に対する値を取得し、DCS移行開始日付とする。
    const transitionStartDate = this._masterSvc.getMPropertyByKey('migration', 'uiuxs2.transitionDate.domesticDcs');
    const firstFlightDate = this._fareFamily?.airOffers?.[0]?.bounds?.[0]?.originDepartureDateTime;
    if (!firstFlightDate) return false;
    // Unix Dateを取得する関数
    const getUnixTime = (d: Date) => Math.floor(d.getTime() / 1000);
    // DCS移行開始日付
    const transitionStartDateUnix = getUnixTime(new Date(transitionStartDate));
    // First flight DateTime
    const firstFlightDateUnix = getUnixTime(new Date(firstFlightDate));
    return transitionStartDateUnix <= firstFlightDateUnix;
  }

  /**
   * Find more Flights画面遷移する前にデータを格納する
   */
  private async updateFindMoreFlightsStore(boundIndex: number) {
    const japanOnlyFlag = (await this._storeService.fetchComplexFlightAvailabilityState()).japanOnlyFlag ?? false;
    // requestの条件を作成
    let requestParameters: FindMoreFlightsRequest = {
      // 選択中FF情報.airOffer.id
      airOfferId: this._fareFamily?.airOffers?.[0].id ?? '',
      // 選択中FF情報.airOffer.boundsの当該引数.バウンドインデックス+1
      moreFlightsBoundReference: boundIndex + 1,
      // 国内DCS移行後日付の国内単独旅程であるかどうか
      isOnlyDomesticAfterDCS: this._checkDomesticAfterDCS() && japanOnlyFlag,
    };

    // プロモーションコードを取得
    const promotionCode = this._searchFlightStoreService.getData().promotion.code;

    // リクエスト用検索条件.プロモーションコード≠””の場合
    if (promotionCode) requestParameters.promotion = { code: promotionCode };
    this._findMoreFlightsStoreService.updateFindMoreFlights({
      searchCondition: requestParameters,
      complexResponseData: this.complexResponse,
    });
  }

  // 遅延・早発発生時のhtml出し分け判定
  public flightPlanChange(bound: Bound) {
    const val1 = bound.originDepartureEstimatedDateTime;
    const val2 = bound.destinationArrivalEstimatedDateTime;
    return val1 || val2;
  }

  /**
   * 表示する運航キャリア名称のHTML作成
   * @param operatingAirlineNameList 表示データ
   * @param delimiter 区切り文字
   * @returns
   */
  public createOperatingAirlineNameList(operatingAirlineNameList: OperatingAirlineInfo[], boundIndex: number): string {
    let operatingAirlineName: string = '';
    // 区切り文字の取得
    const travelersDivider = this._staticMsgPipe.transform('label.separaterComma');
    operatingAirlineNameList.forEach((operatingAirlineList, index) => {
      let delimiter = travelersDivider;
      // 最後は区切り文字入れない
      if (index >= operatingAirlineNameList.length - 1) {
        delimiter = '';
      }
      operatingAirlineName += this.createOperatingAirlineName(operatingAirlineList, index, boundIndex, delimiter);
    });
    return operatingAirlineName;
  }

  private createOperatingAirlineName(
    operatingAirlineList: OperatingAirlineInfo,
    index: number,
    boundIndex: number,
    delimiter: string
  ): string {
    // 提携の場合、URL非表示
    // // URLが存在する場合
    // if (operatingAirlineList.url) {
    //   return `<a class="custom-text01__airlineText--link" href="${operatingAirlineList.url}"
    //     target="_blank" id="complex-flight-availability-operatingAirlineUrl_${boundIndex}_${index}">
    //     ${operatingAirlineList.name}
    //     </a>${delimiter}`;
    // } else {
    //   // URLが存在しない場合
    //   return `<span class="custom-text01__airlineText">${operatingAirlineList.name}${delimiter}</span>`;
    // }

    // URLが存在しない場合
    return `<span class="custom-text01__airlineText">${operatingAirlineList.name}${delimiter}</span>`;
  }
}
