import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  Renderer2,
  ViewEncapsulation,
} from '@angular/core';
import { isSameDay } from '../../../helpers';
import { MasterDataService } from '../../../services';
import { Subject } from 'rxjs';
import { AirBounDisplayType, OperatingAirlineNameType, OperatingAirlineType } from '../../../interfaces';
import {
  RoundtripFppItemAirBoundsDataType,
  RoundtripFppItemBoundDetailsDataType,
  RoundtripFppRequestItinerariesInner,
} from '../../../../common/sdk';
import { TranslatePrefix } from '@conf/asw-master.config';
import { CommonLibService } from '@lib/services';
import { AppConstants } from '@conf/app.constants';

/**
 * フライトサマリPresComponent
 */
@Component({
  selector: 'asw-vacant-seat-item-pres',
  templateUrl: './vacant-seat-item-pres.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class VacantSeatItemPresComponent implements AfterViewInit {
  public appConstants = AppConstants;
  /**
   * Travel Solution情報
   */
  @Input()
  public boundDetails?: RoundtripFppItemBoundDetailsDataType | null;

  /**
   * AirBound表示タイプ
   */
  @Input()
  public airBoundInfo?: Array<AirBounDisplayType>;

  /**
   * 選択済みAirBound情報
   */
  @Input()
  public selectedAirBound?: RoundtripFppItemAirBoundsDataType | null;

  /**
   * 遅延情報
   */
  @Input()
  public isContainedDelayedFlight = false;

  /**
   * 早発情報
   */
  @Input()
  public isContainedEarlyDepartureFlight = false;

  /**
   * 出発地
   */
  @Input()
  public departureLocation?: string;

  /**
   * 出発地太字表示フラグ
   */
  @Input()
  public departureLocationEm?: boolean;

  /**
   * 到着地
   */
  @Input()
  public destinationLocation?: string;

  /**
   * 到着地太字表示フラグ
   */
  @Input()
  public destinationLocationEm?: boolean;

  /**
   * 出発時刻
   */
  @Input()
  public departureTime?: string;

  /**
   * 出発時刻(am/pm)
   */
  @Input()
  public departureTimeMeridian?: string;

  /**
   * 最新出発時刻
   */
  @Input()
  public departureTimeNew?: string;

  /**
   * 最新出発時刻(am/pm)
   */
  @Input()
  public departureTimeNewMeridian?: string;

  /**
   * 到着時刻
   */
  @Input()
  public destinationTime?: string;

  /**
   * 到着時刻(am/pm)
   */
  @Input()
  public destinationTimeMeridian?: string;

  /**
   * 最新到着時刻
   */
  @Input()
  public destinationTimeNew?: string;

  /**
   * 最新到着時刻(am/pm)
   */
  @Input()
  public destinationTimeNewMeridian?: string;

  /**
   * 深夜発
   */
  @Input()
  public isLateNightDeparture?: boolean;

  /**
   * 深夜出発日時
   */
  @Input()
  public lateNightDepartureDate?: string;

  /**
   * 乗継回数
   */
  @Input()
  public numberOfConnection?: number;

  /**
   * 所要時間
   */
  @Input()
  public duration?: string;

  /**
   * 到着日付差
   */
  @Input()
  public arrivalDaysDifference?: number;

  /**
   * 赤字表示要否判定
   */
  @Input()
  public hasRedChar?: boolean;

  /**
   * 全ての日本国内線および日本発着国際線がNHグループ運航便
   */
  @Input()
  public isAllNhGroupOperated?: boolean;

  /**
   * 全ての日本国内線および日本発着国際線がスターアライアンス加盟キャリア運航
   */
  @Input()
  public isAllStarAllianceOperated?: boolean;

  /**
   * 運航キャリア名称
   */
  @Input()
  public operatingAirlinesArray?: Array<OperatingAirlineType>;

  /**
   * 運政府認可申請中情報
   */
  @Input()
  public isContainedPendingGovernmentApproval?: boolean;

  /**
   * ACVに応じたラベルもしくは画像
   */
  @Input()
  public acvMessageKeyList?: Array<string>;

  /**
   * Wi-Fiサービスアイコン
   */
  @Input()
  public wifiAvailableType?: string;

  /**
   * 区間毎の情報
   */
  @Input()
  public boundInfo?: RoundtripFppRequestItinerariesInner[];

  /**
   * 検索条件.キャビンクラス
   */
  @Input()
  public searchConditionCabinClass?: string;

  /**
   * 全Air Bound情報フィルタ後選択不可
   */
  @Input()
  public isAllUnableFareFamilyCodes?: Array<string>;

  /**
   * スクロール連動の計算の制御
   */
  @Input()
  public scrollShadow$?: Subject<'start' | 'end' | 'none'>;

  /**
   * スクロール表示用のパラメータ(国内の場合)
   */
  @Input()
  public isFirstCells?: boolean;

  /**
   * 指定したキャビンクラス以外
   */
  @Input()
  public hasDiffCabinClass?: boolean;

  @Output()
  public selectFareFamily$: EventEmitter<RoundtripFppItemAirBoundsDataType> =
    new EventEmitter<RoundtripFppItemAirBoundsDataType>();

  @Output()
  public seatMapClick$: EventEmitter<any> = new EventEmitter<any>();

  @Output()
  public waitingCountsClick$: EventEmitter<any> = new EventEmitter<any>();

  @Output()
  public scrollButtonClick$: EventEmitter<'previous' | 'next'> = new EventEmitter<'previous' | 'next'>();

  public isOpen = false;

  public wifiSomeAvailableAlt = 'alt.wifiSomeAvailable';

  /** ANAアプリであるか判定 */
  public isAnaApl = false;

  constructor(
    private _masterDataService: MasterDataService,
    private _renderer: Renderer2,
    private _el: ElementRef,
    private _common: CommonLibService
  ) {
    this.isAnaApl = this._common.aswContextStoreService.aswContextData.isAnaApl;
  }

  public ngAfterViewInit(): void {
    this.scrollShadow$?.subscribe((scroll) => {
      if (scroll === 'none') {
        // 左端の影
        const shadowStart = this._el.nativeElement.querySelector('.p-vacant-seat01__scroll-list');
        // 右端の影
        const shadowEnd = this._el.nativeElement.querySelector('.p-vacant-seat01__scroll-item--end');
        if (shadowEnd) {
          this._renderer.removeClass(shadowEnd, 'p-vacant-seat01__scroll-item--shadow');
        }
        if (shadowStart) {
          this._renderer.removeClass(shadowStart, 'p-vacant-seat01__scroll-item--shadow-right');
        }
        return;
      }
      // 前へボタン
      let elPrev;
      // 次へボタン
      let elNext;
      if (this.isFirstCells) {
        elPrev = this._el.nativeElement.querySelector('.ts-l-carousel01-prev');
        elNext = this._el.nativeElement.querySelector('.ts-l-carousel01-next');
        if (elNext) {
          this._renderer.removeClass(elNext, 'is-available');
        }
        if (elPrev) {
          this._renderer.removeClass(elPrev, 'is-available');
        }
      }
      // 左端の影
      const shadowStart = this._el.nativeElement.querySelector('.p-vacant-seat01__scroll-list');
      // 右端の影
      const shadowEnd = this._el.nativeElement.querySelector('.p-vacant-seat01__scroll-item--end');
      if (!(shadowStart && shadowEnd)) {
        return;
      }
      if (scroll === 'end') {
        // 次へボタンを表示
        this.isFirstCells && elNext ? this._renderer.addClass(elNext, 'is-available') : null;
        this._renderer.removeClass(shadowStart, 'p-vacant-seat01__scroll-item--shadow-right');
        // 表示領域以上の場合は影を追加
        this._renderer.addClass(shadowEnd, 'p-vacant-seat01__scroll-item--shadow');
      } else if (scroll === 'start') {
        this.isFirstCells && elPrev ? this._renderer.addClass(elPrev, 'is-available') : null;
        this._renderer.removeClass(shadowEnd, 'p-vacant-seat01__scroll-item--shadow');
        this._renderer.addClass(shadowStart, 'p-vacant-seat01__scroll-item--shadow-right');
      }
    });
  }

  public seatDetailViewChange() {
    if (this.isUnavailable) {
      return;
    }
    this.isOpen = !this.isOpen;
  }

  public selectFareFamily(selectedAirBoundInfo: RoundtripFppItemAirBoundsDataType) {
    if (this.isUnavailable) {
      return;
    }
    this.selectFareFamily$.emit(selectedAirBoundInfo);
  }

  public seatMapClick() {
    if (this.isUnavailable) {
      return;
    }
    this.seatMapClick$.emit();
  }

  public waitingCountsClick() {
    if (this.isUnavailable) {
      return;
    }
    this.waitingCountsClick$.emit();
  }

  public scrollPrevious() {
    this.scrollButtonClick$.emit('previous');
  }

  public scrollNext() {
    this.scrollButtonClick$.emit('next');
  }

  /**
   * 総金額取得
   * @param airBound Air Bound情報
   * @returns
   */
  public getTotalPrice(airBound: RoundtripFppItemAirBoundsDataType) {
    return airBound.airBound?.prices.totalPrice;
  }

  /**
   * ネイビーで囲い表示判断
   *
   * @param airBound: Air Bound情報
   * @returns
   */
  public isSelected(airBound: RoundtripFppItemAirBoundsDataType): boolean {
    return !!airBound.airBoundId && this.selectedAirBound?.airBoundId === airBound.airBoundId;
  }

  /**
   * 便名のリスト
   * @returns
   */
  public get flightNoList(): string {
    const flightNoList: Array<string> = [];
    this.boundDetails?.segments.forEach((segment: any) => {
      flightNoList.push(`${segment.marketingAirlineCode}${segment.marketingFlightNumber}`);
    });
    return flightNoList.join(' ');
  }

  public getCabinKey(cabin: string): string {
    return `${TranslatePrefix.LIST_DATA}PD_930_R-domestic-${cabin}`;
  }

  public newTimeDisplay(dateTime?: string, estimatedDateTime?: string): boolean {
    if (dateTime && estimatedDateTime && isSameDay(dateTime, estimatedDateTime)) {
      // 時分フォーマットで表示
      return true;
    }
    // 月日＋時分フォーマットで表示
    return false;
  }

  /**
   *  出発空港名称を取得する
   * @param name 出発空港コードと名称
   * @returns 出発空港名称
   */
  public getOperatingAirlineName(name: OperatingAirlineNameType) {
    return this._masterDataService.getInTimeCarrierName(name.operatingCode, name.operatingName);
  }

  /**
   * 利用できない判定
   */
  public get isUnavailable() {
    return !!this.boundDetails?.travelSolutionsAvailability?.isUnavailable;
  }

  public getIsAllUnableFareFamilyCodesData(airBoundInfo?: Array<AirBounDisplayType>) {
    return airBoundInfo?.filter((airBound) => {
      return !(this.isAllUnableFareFamilyCodes && this.isAllUnableFareFamilyCodes.includes(airBound.fareFamilyCode));
    });
  }

  /**
   * カンマで連結された運航キャリア名称
   */
  public get contactOperatingAirlinesName() {
    return this._masterDataService.contactOperatingAirlinesName(this.operatingAirlinesArray);
  }

  /** FF情報全て非活性表示の判定 */
  public get isAllFFDisabled(): boolean {
    return (
      this.airBoundInfo?.every((item) => {
        return item.isUnavailable;
      }) || false
    );
  }

  /**
   * 空席待ち人数リンク表示/非表示判定
   */
  public isWaitlistedForFF(): boolean {
    return this.airBoundInfo?.some((airBoundInfoItem) => airBoundInfoItem?.isWaitlisted) || false;
  }
}
