import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { OutputFareConditionsPerPtc, OutputFareConditionsPerPtcBounds } from '@common/interfaces';
import { SupportComponent } from '@lib/components/support-class';
import { LoginStatusType } from '@lib/interfaces';
import { StaticMsgPipe } from '@lib/pipes';
import { CommonLibService } from '@lib/services';

@Component({
  selector: 'asw-plan-review-fare-conditions-per-ptc',
  templateUrl: './plan-review-fare-conditions-per-ptc.component.html',
  styleUrls: ['./plan-review-fare-conditions-per-ptc.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanReviewFareConditionsPerPtcComponent extends SupportComponent {
  /** 特典予約フラグ */
  @Input() isAwardBooking?: boolean = false;

  /** プラン有効判定 */
  @Input() isPlanValid = false;

  /** 画面出力用運賃ルール情報 */
  @Input()
  set data(value: OutputFareConditionsPerPtc) {
    this._data = value;
    this.refresh();
  }
  get data(): OutputFareConditionsPerPtc {
    return this._data;
  }
  private _data: OutputFareConditionsPerPtc = {
    ptc: '',
    displayPtcName: '',
    bounds: [],
  };

  /** 横スクロール可否判定 */
  public isScroll = false;

  constructor(
    private _common: CommonLibService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _staticMsg: StaticMsgPipe
  ) {
    super(_common);
  }

  refresh(): void {
    this._changeDetectorRef.markForCheck();
  }

  reload(): void {}
  init(): void {}

  destroy(): void {}

  /**
   * スクロール有無設定処理
   * ※asw-table-sliderから受け取った値を設定するために使用
   * @param value
   */
  setIsScroll(value: boolean) {
    this.isScroll = value;
  }

  /** 変更ルール */
  getChangeRule(bound: OutputFareConditionsPerPtcBounds) {
    const loginStatus = this._common.aswContextStoreService.aswContextData.loginStatus;
    /**
     * 提携：
     * 有償の場合、当該変更ルールを表示する。
     * 特典の場合、「運賃ルール詳細をご確認ください」の旨を表示する。
     */
    if (!this.isAwardBooking) {
      if (bound.changeConditions.beforeDeparture) {
        return bound.changeConditions.beforeDeparture;
      } else {
        return this._staticMsg.transform('label.hyphen');
      }
    } else {
      return this._staticMsg.transform('label.awardRule');
    }
  }

  /** 払戻ルール */
  getRefundRule(bound: OutputFareConditionsPerPtcBounds) {
    const loginStatus = this._common.aswContextStoreService.aswContextData.loginStatus;
    /**
     * 提携：
     * 有償の場合、当該払戻ルールを表示する。
     * 特典の場合、「運賃ルール詳細をご確認ください」の旨を表示する。
     */
    if (!this.isAwardBooking) {
      if (bound.refundConditions.beforeDeparture) {
        return bound.refundConditions.beforeDeparture;
      } else {
        return this._staticMsg.transform('label.hyphen');
      }
    } else {
      return this._staticMsg.transform('label.awardRule');
    }
  }
}
