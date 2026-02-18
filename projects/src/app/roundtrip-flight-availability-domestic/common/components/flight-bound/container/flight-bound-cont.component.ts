import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import {
  RoundtripFppItemAirBoundDataTypeAirBoundGroupsInner,
  RoundtripFppItemAirBoundsDataType,
  RoundtripFppItemAirCalendarDataTypeAirCalendarPeriodDepartureDatesInner,
  RoundtripFppItemAirCalendarDataTypeAirCalendarPeriodReturnDatesInner,
  RoundtripFppItemBoundDetailsDataType,
  RoundtripFppItemFareFamilyDataTypeInner,
  RoundtripFppItemPricesDataTypeDiscount,
  RoundtripFppRequestItinerariesInner,
} from '../../../sdk';
import {
  AirBounDisplayType,
  FlightSearchCondition,
  FareFamilyOutputType,
  FilterConditionDomestic,
  ServiceInfoListType,
  travelSolutionDisplayType,
  ITINERARY_DIVISION,
  AllAirBounDisplayAndTsType,
} from '../../../interfaces';
import { Observable } from 'rxjs';
import { airBoundFilter } from '../../../helpers';
import { MasterDataService } from '../../../services';

/**
 * バウンドリストContComponent
 */
@Component({
  selector: 'asw-flight-bound-cont',
  templateUrl: './flight-bound-cont.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlightBoundContComponent implements OnChanges {
  /**
   * 出発日
   */
  @Input()
  public departureDate?: string;

  /**
   * travelSolution情報
   */
  @Input()
  public travelSolution?: Array<RoundtripFppItemAirBoundDataTypeAirBoundGroupsInner>;

  /**
   * FF情報
   */
  @Input()
  public fareFamilies?: Array<RoundtripFppItemFareFamilyDataTypeInner>;

  /**
   * 検索条件.区間毎の情報
   */
  @Input()
  public itinerary?: RoundtripFppRequestItinerariesInner;

  /**
   * FF概要表示切替
   */
  @Input()
  public ffSummaryDisplay?: boolean;

  /**
   * 選択したAir Bound情報
   */
  @Input()
  public selectedAirBound?: RoundtripFppItemAirBoundsDataType | null;

  /**
   * 出発日ボタン押下処理(選択した往路Air Bound情報が存在する)
   */
  @Input()
  public outSelectedAirBound?: RoundtripFppItemAirBoundsDataType | null;

  /**
   * 選択したTravel Solution情報
   */
  @Input()
  public selectedTS?: RoundtripFppItemBoundDetailsDataType | null;

  /**
   * 出発地
   */
  @Input()
  public departureLocation?: string;

  /**
   * 到着地
   */
  @Input()
  public arrivalLocation?: string;

  /**
   * 乗継空港
   */
  @Input()
  public transferAirport?: Array<string>;

  /**
   * 7日間カレンダー
   */
  @Input()
  public departureDates?: Array<
    | RoundtripFppItemAirCalendarDataTypeAirCalendarPeriodDepartureDatesInner
    | RoundtripFppItemAirCalendarDataTypeAirCalendarPeriodReturnDatesInner
  >;

  /**
   * フィルター条件
   */
  @Input()
  public filterCondition?: FilterConditionDomestic;

  /**
   * FF選択ボタンイベント
   */
  @Output()
  public selectFareFamily$: EventEmitter<FareFamilyOutputType> = new EventEmitter<FareFamilyOutputType>();

  /**
   * フライト再選択ボタンイベント
   */
  @Output()
  public showOtherFlights$: EventEmitter<void> = new EventEmitter<void>();

  /**
   * 選択種別
   */
  @Input()
  public status?: 'unSelected' | 'selected';

  /**
   * 往復種別
   */
  @Input()
  public type?: 'out' | 'return';

  /**
   * 検索条件
   */
  @Input()
  public searchCondition?: FlightSearchCondition;

  /**
   * scrollEvent
   */
  @Input()
  public scrollEvent$?: Observable<boolean>;

  /**
   * AirBound表示タイプ
   */
  @Input()
  public airBoundInfos?: Array<AirBounDisplayType>;

  /**
   * FF概要表示切替ボタンイベント
   */
  @Output()
  public changeDisplay$: EventEmitter<boolean> = new EventEmitter<boolean>();

  /**
   * 出発日ボタンイベント
   */
  @Output()
  public selectCalendar$: EventEmitter<string> = new EventEmitter<string>();

  @Output()
  public isHasPromotionsResult$: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Output()
  public selectedCancel$: EventEmitter<AllAirBounDisplayAndTsType> = new EventEmitter<AllAirBounDisplayAndTsType>();

  /**
   * 無料預け入れ手荷物個数表示可否
   */
  public baggageFreeCheckedShow?: boolean;

  /**
   * ANAカウチ利用可が含まれるセグメント
   */
  public anaCouchSegments?: any;

  /**
   * サービス情報リスト
   */
  public svcInfoList?: ServiceInfoListType;

  /**
   * 空席待ち不可が存在する検索結果リスト
   */
  public hasNonWaitlistResult?: boolean;

  /**
   * ジュニアパイロット不可が存在する検索結果リスト
   */
  public hasDisallowdedJuniorPilotResult?: boolean;

  /**
   * カウチあり機材リスト
   */
  public couchEquipmentList?: Array<string>;

  /**
   * プロモーションが存在する検索結果リスト(FF選択モーダルで使用される)
   */
  public hasPromotionsResult?: boolean;

  /**
   * 全Air Bound情報フィルタ後選択不可
   */
  public isAllUnableFareFamilyCodes?: Array<string>;

  /**
   * 検索結果表示用のデータ
   */
  public travelSolutionDisplay: Array<travelSolutionDisplayType | any> = [];

  /**
   * 指定したキャビンクラス以外
   */
  public hasDiffCabinClass = false;

  /**
   * 指定したキャビンクラス
   */
  public currentCabin?: string;

  constructor(private _masterDataService: MasterDataService, private _changeDetectorRef: ChangeDetectorRef) {}

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['fareFamilies'] || changes['travelSolution'] || changes['filterCondition']) {
      this._convetTSToDisplay();
    }
  }

  /**
   * FF選択ボタン押下
   * @param fareFamilyInfo FF情報出力
   */
  public selectFareFamily(fareFamilyInfo: FareFamilyOutputType) {
    this.selectFareFamily$.emit(fareFamilyInfo);
  }

  /**
   * フライト再選択ボタン押下
   */
  public showOtherFlights() {
    this.showOtherFlights$.emit();
  }

  /**
   * 出発日ボタン押下
   * @param date 日時
   */
  public selectCalendar(date: string) {
    this.selectCalendar$.emit(date);
  }

  /**
   * FF概要表示切替ボタン押下
   * @param display 表示要否
   */
  public changeDisplay(display: boolean) {
    this.changeDisplay$.emit(display);
  }

  /**
   * TS変換処理
   */
  private _convetTSToDisplay() {
    if (this.fareFamilies && this.travelSolution) {
      //	以下の処理にて、すべてのAir Offer情報がフィルタ後選択不可能のFare Family情報かどうかを判定する。
      const isAllUnableFareFamilyCodes: Array<string> = [];
      this.fareFamilies?.forEach((fareFamily) => {
        if (
          this.travelSolution?.every((result) => {
            if (!result?.[fareFamily.fareFamilyCode]) {
              return true;
            }
            const canChoose = airBoundFilter(
              result?.[fareFamily.fareFamilyCode],
              this.filterCondition,
              this.type,
              fareFamily.fareFamilyWithService.priorityCode
            );
            return (
              fareFamily.fareFamilyWithService.priorityCode !== result?.[fareFamily.fareFamilyCode].priorityCode ||
              !canChoose
            );
          })
        ) {
          isAllUnableFareFamilyCodes.push(fareFamily.fareFamilyCode);
        }
      });
      this.isAllUnableFareFamilyCodes = isAllUnableFareFamilyCodes;

      // 画面表示用のデータ結構に変換する
      const travelSolutionDisplay: Array<travelSolutionDisplayType | any> = [];
      // サービス情報リスト
      let serviceInfoList = {};
      // ANAカウチ利用可
      let anaCouchSegments: any = {};
      // プロモーションが存在する検索結果リスト
      let hasPromotionsResult = false;
      // 無料預け入れ手荷物個数表示可否
      let baggageFreeCheckedShow = false;
      // 空席待ち不可が存在する検索結果リスト
      let hasNonWaitlistResult = false;
      // ジュニアパイロット不可が存在する検索結果リスト
      let hasDisallowdedJuniorPilotResult = false;
      // すべてAir Bound情報
      let allAirBoundInfos: Array<AirBounDisplayType> = [];
      const fareFamilyCodes: string[] = this.fareFamilies.map((item) => item.fareFamilyCode);
      let currentCabin = this.searchCondition?.fare.cabinClass;
      if (this.searchCondition?.fare.isMixedCabin) {
        this.type === 'out'
          ? (currentCabin = this.searchCondition?.fare.mixedCabinClasses?.departureCabinClass)
          : (currentCabin = this.searchCondition?.fare.mixedCabinClasses?.returnCabinClass);
      }
      this.currentCabin = currentCabin;
      this.travelSolution.forEach((ts) => {
        let airBoundInfos: Array<AirBounDisplayType> = [];
        this.fareFamilies?.forEach((ff) => {
          if (ff.minFreeCheckedBaggageQuantity !== undefined && ff.minFreeCheckedBaggageQuantity !== null) {
            baggageFreeCheckedShow = true;
          }
          const airBoundInfo = ts[ff.fareFamilyCode];
          if (!airBoundInfo) {
            airBoundInfos.push({
              cabin: ff.fareFamilyWithService.cabin,
              isCanChooseAfterFilter: false,
              fareFamilyCode: ff.fareFamilyCode,
            } as AirBounDisplayType);
          } else {
            const canChoose = airBoundFilter(
              airBoundInfo,
              this.filterCondition,
              this.type,
              ff.fareFamilyWithService.priorityCode
            );
            if (airBoundInfo) {
              airBoundInfos.push({
                ...airBoundInfo,
                isCanChooseAfterFilter: canChoose,
                fareFamilyCode: ff.fareFamilyCode,
              });
            }
            if (
              airBoundInfo.unavailableReason ===
              RoundtripFppItemAirBoundsDataType.UnavailableReasonEnum.UnavailableJuniorPilot
            ) {
              hasDisallowdedJuniorPilotResult = true;
            }
            if (airBoundInfo.unavailableReason === RoundtripFppItemAirBoundsDataType.UnavailableReasonEnum.SoldOut) {
              hasNonWaitlistResult = true;
            }
          }
        });

        /*
          アプリケーション情報.検索条件.キャビンクラス＝Travel SolutionとAir Bound情報.cabinの場合、左の領域に表示
          アプリケーション情報.検索条件.キャビンクラス≠Travel SolutionとAir Bound情報.cabin、
          かつアプリケーション情報.検索条件.キャビンクラス≠Travel SolutionとAir Bound情報.cabinの1件目の場合、右の領域に表示
        */
        let filterAirBoundInfos: Array<AirBounDisplayType> = airBoundInfos?.filter(
          (item) => item.cabin === currentCabin
        );
        const notEqualAirBoundInfo = airBoundInfos?.find((item) => item.cabin !== currentCabin);
        if (notEqualAirBoundInfo) {
          this.hasDiffCabinClass = true;
          filterAirBoundInfos?.push(notEqualAirBoundInfo);
        }
        airBoundInfos = filterAirBoundInfos;
        // Travel SolutionとAir Bound情報.boundDetails.segmentsの件数分繰り返し
        ts.boundDetails.segments.forEach((segment) => {
          // サービス情報リストを取得する
          let itineraryDivision = ITINERARY_DIVISION.JP;
          const serviceInfo = this._masterDataService.getSvcInfo({
            itineraryDivision: itineraryDivision,
            cabin: segment.cabin,
          });
          serviceInfoList = {
            ...serviceInfoList,
            [segment.id]: serviceInfo,
          };

          // ANAカウチ利用可が含まれる
          fareFamilyCodes?.forEach((value) => {
            if (ts[value] && ts[value][segment.id]) {
              ts[value][segment.id].service?.isCouchAvailable ? (anaCouchSegments[segment.id] = true) : null;
            } else {
              return;
            }
            // アプリケーション情報.プロモーションが存在する検索結果リスト
            const discount = ts?.[value]?.airBound?.prices?.totalPrice
              ?.discount as RoundtripFppItemPricesDataTypeDiscount;
            if (
              !hasPromotionsResult &&
              (discount?.cat25DiscountName ||
                (discount?.originalTotal !== undefined && discount?.originalTotal !== null) ||
                discount?.aamDiscountCode)
            ) {
              hasPromotionsResult = true;
            }
          });
        });
        let cheapestRoundtrip;
        let boundDetailsHasPromotions = false;
        fareFamilyCodes?.forEach((fareFamilyCode) => {
          const airBoundInfo: RoundtripFppItemAirBoundsDataType = ts?.[fareFamilyCode];
          if (!airBoundInfo) {
            return;
          }
          // TS.プロモーションが存在する検索結果リスト
          const discount = airBoundInfo?.airBound?.prices?.totalPrice
            ?.discount as RoundtripFppItemPricesDataTypeDiscount;
          if (
            hasPromotionsResult &&
            (discount?.cat25DiscountName ||
              (discount?.originalTotal !== undefined && discount?.originalTotal !== null) ||
              discount?.aamDiscountCode)
          ) {
            boundDetailsHasPromotions = true;
          }
          if (airBoundInfo.airBound?.prices.isCheapest) {
            cheapestRoundtrip = airBoundInfo;
          }
        });
        const covertedTS = {
          airBoundInfo: airBoundInfos,
          boundDetails: {
            ...ts.boundDetails,
            ...{ hasPromotion: boundDetailsHasPromotions, cheapestRoundtrip: cheapestRoundtrip },
          },
        };
        allAirBoundInfos = allAirBoundInfos.concat(airBoundInfos);
        travelSolutionDisplay.push(covertedTS);
      });
      this.selectedCancel$.emit({ allAirBound: allAirBoundInfos, allTsDisplay: travelSolutionDisplay });
      // サービス情報リスト、ANAカウチ利用可、プロモーションが存在する検索結果リスト、無料預け入れ手荷物個数表示可否
      this.svcInfoList = serviceInfoList;
      this.anaCouchSegments = anaCouchSegments;
      this.hasPromotionsResult = hasPromotionsResult;
      this.baggageFreeCheckedShow = baggageFreeCheckedShow;
      this.isHasPromotionsResult$.next(hasPromotionsResult);
      this.hasNonWaitlistResult = hasNonWaitlistResult;
      this.hasDisallowdedJuniorPilotResult = hasDisallowdedJuniorPilotResult;
      // 表示用検索結果
      this.travelSolutionDisplay = travelSolutionDisplay;
      this._changeDetectorRef.markForCheck();
    }
  }
}
