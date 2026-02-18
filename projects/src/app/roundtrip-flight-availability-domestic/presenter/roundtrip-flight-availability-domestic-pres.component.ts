import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Inject,
  Input,
  Output,
  Renderer2,
} from '@angular/core';
import { AllAirBounDisplayAndTsType, FlightSearchCondition } from '../common/interfaces';
import { Observable, Subject } from 'rxjs';
import { AswContextStoreService } from '@lib/services';
import { AppConstants, TranslatePrefix } from '@conf/index';
import { AirBounDisplayType, FilterConditionDomestic, FareFamilyOutputType, SortOrder } from '../common/interfaces';
import { SEARCH_TYPE } from '../common/interfaces/flight-availability';
import {
  NumberOfTravelers,
  RoundtripFppItemAirBoundDataTypeAirBoundGroupsInner,
  RoundtripFppItemAirBoundsDataType,
  RoundtripFppItemAirCalendarDataType,
  RoundtripFppItemBoundDetailsDataType,
  RoundtripFppItemFareFamilyDataTypeInner,
  RoundtripFppResponse,
  RoundtripFppRequestItinerariesInner,
} from '../common/sdk';
import { CriteoAlignmentInfo } from '@common/components';
import { BoundType } from '../container';
import { DOCUMENT } from '@angular/common';

/**
 * 往復空席照会結果(国内)画面PresComponent
 * (往路: out / 復路: return)
 */
@Component({
  selector: 'asw-roundtrip-flight-availability-domestic-pres',
  templateUrl: './roundtrip-flight-availability-domestic-pres.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoundtripFlightAvailabilityDomesticPresComponent implements AfterViewChecked {
  public appConstants = AppConstants;

  /**
   * 往路:選択した往路Air Bound情報
   */
  @Input()
  public outSelectedAirBound?: RoundtripFppItemAirBoundsDataType | null;

  /**
   * 復路:選択した復路Air Bound情報
   */
  @Input()
  public returnSelectedAirBound?: RoundtripFppItemAirBoundsDataType | null;

  /**
   * 復路:7日間空席照会結果
   */
  @Input()
  public returnAirCalendar?: RoundtripFppItemAirCalendarDataType;

  /**
   * 往路:7日間空席照会結果
   */
  @Input()
  public outAirCalendar?: RoundtripFppItemAirCalendarDataType;

  /**
   * 往路:出発日
   */
  @Input()
  public outDepartureDate?: string;

  /**
   * 復路:出発日
   */
  @Input()
  public returnDepartureDate?: string;

  /**
   * 往路:出発地
   */
  @Input()
  public outDepartureLocation?: string;

  /**
   * 復路:出発地
   */
  @Input()
  public returnDepartureLocation?: string;

  /**
   * 往路:到着地
   */
  @Input()
  public outArrivalLocation?: string;

  /**
   * 復路:到着地
   */
  @Input()
  public returnArrivalLocation?: string;

  /**
   * 往路:乗継空港
   */
  @Input()
  public outTransferAirport?: Array<string>;

  /**
   * 復路:乗継空港
   */
  @Input()
  public returnTransferAirport?: Array<string>;

  /**
   * 往路:変更旅程空席照会情報
   */
  @Input()
  public outSearchResult?: RoundtripFppResponse | null;

  /**
   * 復路:変更旅程空席照会情報
   */
  @Input()
  public returnSearchResult?: RoundtripFppResponse | null;

  /**
   * 往路:初期表示時フィルタ変更旅程空席照会情報
   */
  @Input()
  public outFilterSearchResult?: Array<RoundtripFppItemAirBoundDataTypeAirBoundGroupsInner>;

  /**
   * 復路:初期表示時フィルタ変更旅程空席照会情報
   */
  @Input()
  public returnFilterSearchResult?: Array<RoundtripFppItemAirBoundDataTypeAirBoundGroupsInner>;

  /**
   * 往路:FareFamily ヘッダ
   */
  @Input()
  public outFareFamilies?: Array<RoundtripFppItemFareFamilyDataTypeInner>;

  /**
   * 復路:FareFamily
   */
  @Input()
  public returnFareFamilies?: Array<RoundtripFppItemFareFamilyDataTypeInner>;

  /**
   * FareFamily
   */
  @Input()
  public fareFamilies?: Array<RoundtripFppItemFareFamilyDataTypeInner>;

  /**
   * 検索条件
   */
  @Input()
  public searchCondition?: FlightSearchCondition;

  /**
   * 往路:FF概要表示切替
   */
  @Input()
  public outFFSummaryDisplay?: boolean;

  /**
   * 復路:FF概要表示切替
   */
  @Input()
  public returnFFSummaryDisplay?: boolean;

  /**
   * 往路:検索条件.区間毎の情報
   */
  @Input()
  public outItinerary?: RoundtripFppRequestItinerariesInner;

  /**
   * 復路:検索条件.区間毎の情報
   */
  @Input()
  public returnItinerary?: RoundtripFppRequestItinerariesInner;

  /**
   * 往路: 初期表示時選択可能な便
   */
  @Input()
  public outSeatAvailability?: boolean;

  /**
   * 復路: 初期表示時選択可能な便
   */
  @Input()
  public returnSeatAvailability?: boolean;

  /**
   * 選択した往路Travel Solution情報
   */
  @Input()
  public outSelectedTS?: RoundtripFppItemBoundDetailsDataType | null;

  /**
   * 選択した復路Travel Solution情報
   */
  @Input()
  public returnSelectedTS?: RoundtripFppItemBoundDetailsDataType | null;

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
   * 往路:FF選択のすべてBoundInfo
   */
  @Input()
  public outAirBoundInfos?: Array<AirBounDisplayType>;

  /**
   * 復路:FF選択のすべてBoundInfo
   */
  @Input()
  public returnAirBoundInfos?: Array<AirBounDisplayType>;

  /**
   * 検索時刻
   */
  @Input()
  public searchTime?: string;

  /**
   * スクロールイベント
   */
  @Input()
  public scrollEvent$?: Observable<boolean>;

  /**
   * フィルタ条件の詳細
   */
  @Input()
  public filterConditionInit$?: Observable<SEARCH_TYPE>;

  /**
   * 検索結果操作部.運賃オプション切替ボタン表示条件
   */
  @Input()
  public isFareOptionDisplay?: boolean;

  /**
   * 往路: フィルター条件
   */
  @Input()
  public outFilterCondition?: FilterConditionDomestic;

  /**
   * お気に入り登録済み
   */
  @Input()
  public isRegisteredFavorite?: boolean;

  /**
   * 復路: フィルター条件
   */
  @Input()
  public returnFilterCondition?: FilterConditionDomestic;

  /**
   * 現在表示されている並べ替え順序
   */
  @Input()
  public currentSortOrder?: SortOrder;

  /**
   * 履歴用検索条件.搭乗者数
   */
  @Input()
  public travelers?: NumberOfTravelers;

  /** criteo連携情報 */
  @Input()
  public criteoAlignmentInfo: CriteoAlignmentInfo = {};

  @Output()
  public selectOutFareFamily$: EventEmitter<FareFamilyOutputType> = new EventEmitter<FareFamilyOutputType>();

  @Output()
  public selectReturnFareFamily$: EventEmitter<FareFamilyOutputType> = new EventEmitter<FareFamilyOutputType>();

  @Output()
  public showOtherOutFlights$: EventEmitter<void> = new EventEmitter<void>();

  @Output()
  public showOtherReturnFlights$: EventEmitter<void> = new EventEmitter<void>();

  @Output()
  public filterApply$: EventEmitter<{ condition?: FilterConditionDomestic; isInit?: boolean }> = new EventEmitter<{
    condition?: FilterConditionDomestic;
    isInit?: boolean;
  }>();

  @Output()
  public sortApply$: EventEmitter<SortOrder> = new EventEmitter<SortOrder>();

  @Output()
  public selectReturnCalendar$: EventEmitter<string> = new EventEmitter<string>();

  @Output()
  public selectOutCalendar$: EventEmitter<string> = new EventEmitter<string>();

  @Output()
  public continue$: EventEmitter<void> = new EventEmitter<void>();

  @Output()
  public selectedCancel$: EventEmitter<{
    data: AllAirBounDisplayAndTsType;
    type: BoundType;
  }> = new EventEmitter<{
    data: AllAirBounDisplayAndTsType;
    type: BoundType;
  }>();

  @Output()
  public changeOutDisplay$: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Output()
  public changeReturnDisplay$: EventEmitter<boolean> = new EventEmitter<boolean>();

  /**
   * お気に入り追加
   */
  @Output()
  public addToFavorite$: EventEmitter<void> = new EventEmitter<void>();

  /**
   * キャビンクラス切替
   */
  @Output()
  public changeCabin$: EventEmitter<string> = new EventEmitter<string>();

  /**
   * 往路:プロモーションが存在する検索結果リスト(FF選択モーダルで使用される)
   */
  public outHasPromotionsResult?: boolean;

  /**
   * 復路:プロモーションが存在する検索結果リスト(FF選択モーダルで使用される)
   */
  public returnHasPromotionsResult?: boolean;

  public timeZone: string;

  public filterClick$: Subject<boolean> = new Subject();

  public sortClick$: Subject<boolean> = new Subject();

  constructor(
    private _aswContextSvc: AswContextStoreService,
    @Inject(DOCUMENT) private document: Document,
    private _renderer: Renderer2
  ) {
    this.timeZone = `${TranslatePrefix.LIST_DATA}PD_113_${this._aswContextSvc.aswContextData.posCountryCode}`;
  }

  ngAfterViewChecked(): void {
    // 画面下部固定フローティングナビの高さを取得
    const bottomFloat = this.document.getElementsByClassName('l-bottom-float');
    const bottomFloatHeight = window.getComputedStyle(bottomFloat[0]).height;
    // 取得した値 + 8pxをdiv.l-containerのpadding-bottom値として設定
    const containerEl = this.document.getElementById('anchor-page-top');
    this._renderer.setStyle(
      containerEl,
      'padding-bottom',
      `${(Number(bottomFloatHeight.replace('px', '')) + 8).toString()}px`
    );
  }

  /**
   * FF選択ボタン押下処理(往路の場合)
   * @param fareFamilyInfo FF情報
   */
  public selectOutFareFamily(fareFamilyInfo: FareFamilyOutputType) {
    this.selectOutFareFamily$.emit(fareFamilyInfo);
  }

  /**
   * 往路表示
   * @param display boolean
   */
  public changeOutDisplay(display: boolean) {
    this.changeOutDisplay$.emit(display);
  }

  /**
   * 復路表示
   * @param display boolean
   */
  public changeReturnDisplay(display: boolean) {
    this.changeReturnDisplay$.emit(display);
  }

  /**
   * FF選択ボタン押下処理(復路の場合)
   * @param fareFamilyInfo FF情報
   */
  public selectReturnFareFamily(fareFamilyInfo: FareFamilyOutputType) {
    this.selectReturnFareFamily$.emit(fareFamilyInfo);
  }

  /** 往路: フライト再選択 */
  public showOtherOutFlights() {
    this.showOtherOutFlights$.emit();
  }

  /** 復路: フライト再選択 */
  public showOtherReturnFlights() {
    this.showOtherReturnFlights$.emit();
  }

  /**
   * フィルタ条件モーダル適用ボタン押下処理
   * @param dataInfo フィルタ条件
   */
  public filterApply(dataInfo: { condition?: FilterConditionDomestic; isInit?: boolean }) {
    this.filterApply$.emit(dataInfo);
  }

  /**
   * キャビンクラス切替ボタン押下処理
   * @param cabin 選択したキャビンクラス
   */
  public changeCabin(cabin: string) {
    this.changeCabin$.emit(cabin);
  }

  /**
   * ソート条件モーダル適用ボタン押下処理
   * @param sortOrder ソート種別
   */
  public sortApply(sortOrder: SortOrder) {
    this.sortApply$.emit(sortOrder);
  }

  /**
   * 復路カレンダー選択
   * @param date 日付
   */
  public selectReturnCalendar(date: string) {
    this.selectReturnCalendar$.emit(date);
  }

  /**
   * 往路カレンダー選択
   * @param date 日付
   */
  public selectOutCalendar(date: string) {
    this.selectOutCalendar$.emit(date);
  }

  /**
   * 次へボタン押下処理(検索結果フッタ)
   */
  public continue() {
    this.continue$.emit();
  }

  /**
   * フィルタ条件モーダルを開く処理
   */
  public openFilter() {
    this.filterClick$.next(true);
  }

  /**
   * ソート条件モーダルを開く処理
   */
  public openSort() {
    this.sortClick$.next(true);
  }

  /**
   * お気に入り追加ボタン押下処理
   */
  public addToFavorite() {
    this.addToFavorite$.emit();
  }

  /**
   * 往路:プロモーションが存在する検索結果リスト(FF選択モーダルで使用される)
   */
  public isOutHasPromotionsResult(hasPromotions: boolean) {
    this.outHasPromotionsResult = hasPromotions;
  }

  /**
   * 復路:プロモーションが存在する検索結果リスト(FF選択モーダルで使用される)
   */
  public isReturnHasPromotionsResult(hasPromotions: boolean) {
    this.returnHasPromotionsResult = hasPromotions;
  }

  /**
   * 往路:選択解除設定
   */
  public outSelectedCancel(data: AllAirBounDisplayAndTsType) {
    this.selectedCancel$.emit({ data: data, type: BoundType.OUT });
  }

  /**
   * 復路:選択解除設定
   */
  public returnSelectedCancel(data: AllAirBounDisplayAndTsType) {
    this.selectedCancel$.emit({ data: data, type: BoundType.RETURN });
  }
}
