import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { FilterConditionModalService } from '@common/components/shopping/filter-condition/filter-condition-modal.service';
import { SupportComponent } from '@lib/components/support-class';
import { isSP } from '@lib/helpers/common';
import { AswMasterService, CommonLibService, PageLoadingService } from '@lib/services';
import { fromEvent } from 'rxjs/internal/observable/fromEvent';
import { debounceTime } from 'rxjs/operators';
import { PresenterProps } from './find-more-flights-pres.state';
import { ComplexFmfFareFamilyAirOffersInner } from 'src/sdk-search/model/complexFmfFareFamilyAirOffersInner';
import { FilterConditionData } from '@common/interfaces';
import { SortConditionData, SortCondition, SortConditionModalService, sortConditionValueMap } from '@common/components';
import { FindMoreFlightsStoreService } from '@common/services/store/find-more-flights/find-more-flights-store/find-more-flights-store.service';
import { Router } from '@angular/router';
import { RoutesResRoutes } from '@conf/routes.config';
import { FindMoreFlightsService } from '../container/find-more-flights.service';
import { MASTER_TABLE } from '@conf/asw-master.config';
import { StaticMsgPipe } from '@lib/pipes';

@Component({
  selector: 'asw-find-more-flights-pres',
  templateUrl: './find-more-flights-pres.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FindMoreFlightsPresComponent extends SupportComponent {
  // プロパティ定義
  /** コンテナから渡される引数 */
  public _props: PresenterProps = {};
  /** 検索時刻 */
  public searchDateTimeString: string = '';
  /** 画面描画用 選択済みソート条件 */
  public sortConditionData?: SortConditionData;
  /** 画面描画用 バウンド毎のフィルタ項目 */
  public filterConditionData?: FilterConditionData;
  /** 画面描画用 FindMoreFlightバウンドリスト */
  public currentBoundIndex: number = 0;
  /** 画面描画用 FindMoreFlightフライトサマリ */
  public airOffersList?: ComplexFmfFareFamilyAirOffersInner[];
  /** フライト検索リクエストデータ */
  /** 出発地コード */
  public boundDepartureAirportCode?: string;
  /** 到着地コード */
  public boundArrivalAirportCode?: string;
  /** 乗継地コード */
  public boundTransitAirportCode?: Array<string>;
  /** 表示用出発地 */
  public departure?: string = '';
  /** 表示用到着地 */
  public arrival?: string = '';
  /** 表示用乗継地 */
  public transit?: string;
  /** 表示用出発日 */
  public boundDepartureDate?: string;
  /** ソート条件リスト */
  private _itemList: Record<number, string> = {};
  /** ソート条件モーダル用データ */
  public sortDataForDisplay = 'reader.sort';
  /** フィルタ条件モーダルリセット用値 */
  private _originalFilterConditionData: FilterConditionData = {};

  @Input()
  public moreFlightsBoundReference?: number;

  @Input()
  set props(data: PresenterProps) {
    this._props = data;
    this.searchDateTimeString = this.props.searchDateTimeString ?? '';
    this.currentBoundIndex = this.props.currentBoundIndex ?? 0;
    this.airOffersList = this.props.airOffersList;
    this.sortConditionData = this.props.sortConditionData;
    this.filterConditionData = this.props.filterConditionData;
    this.sortDataForDisplay =
      this._itemList[this.sortConditionData?.selectedSortCondition ?? SortCondition.CPD_RANK] ?? 'reader.sort';
    this._changeDetector.markForCheck();
    this.boundDepartureAirportCode =
      this.props.searchRequestData?.request?.itineraries?.[this.currentBoundIndex]?.originLocationCode ?? '';
    this.boundArrivalAirportCode =
      this.props.searchRequestData?.request?.itineraries?.[this.currentBoundIndex]?.destinationLocationCode ?? '';
    this.boundTransitAirportCode =
      this.props.searchRequestData?.request?.itineraries?.[this.currentBoundIndex]?.connection?.locationCodes ?? [];
    this.boundDepartureDate =
      this.props.searchRequestData?.request?.itineraries?.[this.currentBoundIndex]?.departureDate ?? '';
    this._originalFilterConditionData = this.props.originalFilterConditionData ?? {};
  }
  get props(): PresenterProps {
    return this._props!;
  }

  constructor(
    private _common: CommonLibService,
    private _changeDetector: ChangeDetectorRef,
    private _sortConditionModalService: SortConditionModalService,
    private _filterConditionModalService: FilterConditionModalService,
    private _aswMasterSvc: AswMasterService,
    private _findMoreFlightsStoreService: FindMoreFlightsStoreService,
    private _router: Router,
    private _findMoreFlightsService: FindMoreFlightsService,
    private _pageLoadingService: PageLoadingService,
    private _staticMsgPipe: StaticMsgPipe
  ) {
    super(_common);
  }

  reload(): void {}

  init(): void {
    this.subscribeService(
      'FilterAndRecommendResize',
      fromEvent(window, 'resize').pipe(debounceTime(100)),
      this.resizeEvent
    );

    // 出発地
    this.departure = this._findMoreFlightsService.getForSearchAirportName(this.boundDepartureAirportCode);
    // 到着地
    this.arrival = this._findMoreFlightsService.getForSearchAirportName(this.boundArrivalAirportCode);
    // 乗継地
    const separator = this._staticMsgPipe.transform('label.separaterComma');
    this.transit = this.boundTransitAirportCode
      ?.map((airPortCode) => this._findMoreFlightsService.getForSearchAirportName(airPortCode))
      .join(separator);

    this.subscribeService(
      'FmF GetCache',
      this._aswMasterSvc.load([MASTER_TABLE.SERVICE_CONTENTS, MASTER_TABLE.AIRLINE_I18NJOINALL], true),
      () => {
        this.deleteSubscription('FmF GetCache');
        this._changeDetector.markForCheck();
      }
    );
    this._itemList = {
      [SortCondition.CPD_RANK]: sortConditionValueMap.get(SortCondition.CPD_RANK)?.label!,
      [SortCondition.DEPARTURE_TIME]: sortConditionValueMap.get(SortCondition.DEPARTURE_TIME)?.label!,
      [SortCondition.ARRIVAL_TIME]: sortConditionValueMap.get(SortCondition.ARRIVAL_TIME)?.label!,
      [SortCondition.DURATION]: sortConditionValueMap.get(SortCondition.DURATION)?.label!,
      [SortCondition.PriceDifference]: sortConditionValueMap.get(SortCondition.PriceDifference)?.label!,
    };

    this.sortDataForDisplay = this._itemList[this.sortConditionData?.selectedSortCondition ?? SortCondition.CPD_RANK];
  }

  destroy(): void {
    this.deleteSubscription('FilterAndRecommendResize');
    this.deleteSubscription('FmF GetAirportName');
    this.deleteSubscription('FmF GetFfList');
    this.deleteSubscription('FmF GetPriorityCode');
  }

  // 端末認識処理
  public isSp = isSP();
  public isSpPre = isSP();
  /**
   * 画面サイズの変更検知
   */
  private resizeEvent = () => {
    this.isSpPre = this.isSp;
    this.isSp = isSP();
    if (this.isSpPre !== this.isSp) {
      this._changeDetector.markForCheck();
    }
  };

  /**
   * ソート条件モーダル開く
   */
  public openSortConditionModal() {
    if (this.sortConditionData) this._sortConditionModalService.openModal(this.sortConditionData);
  }

  /**
   * フィルタ条件モーダル開く
   */
  public openFilterConditionModal() {
    // フィルタ条件モーダル用キャッシュ取得
    this.subscribeService(
      'FilterModalCacheGet',
      this._aswMasterSvc.load([MASTER_TABLE.AIRLINE_I18NJOINALL, MASTER_TABLE.AIRPORT_I18N_JOIN_BY_AIRPORT_CODE], true),
      () => {
        this.deleteSubscription('FilterModalCacheGet');
        if (this.filterConditionData)
          this._filterConditionModalService.openModal(
            this.filterConditionData,
            this._originalFilterConditionData,
            this.currentBoundIndex + 1
          );
      }
    );
  }

  /**
   * TS選択ボタン押下時処理
   * @param selectedAirOffer
   */
  public airOfferSelect(selectedAirOffer: ComplexFmfFareFamilyAirOffersInner) {
    this._pageLoadingService.startLoading();
    this._findMoreFlightsStoreService.updateFindMoreFlights({ selectedAirOffer });
    const selectedFareFamilyCode = this._props.FareFamily?.fareFamilyCode;
    this._findMoreFlightsStoreService.updateFindMoreFlights({ selectedFareFamilyCode });
    this._pageLoadingService.endLoading();
    this._router.navigateByUrl(RoutesResRoutes.COMPLEX_FLIGHT_AVAILABILITY);
  }
}
