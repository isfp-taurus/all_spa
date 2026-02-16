import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Output } from '@angular/core';
import { SupportComponent } from '@lib/components/support-class';
import { isPC } from '@lib/helpers';
import { CommonLibService } from '@lib/services';
import { fromEvent, throttleTime } from 'rxjs';

/**
 * 予約・購入完了
 */
@Component({
  selector: 'asw-booking-completed-button-area',
  templateUrl: './booking-completed-button-area.component.html',
  styleUrls: ['./booking-completed-button-area.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingCompletedButtonAreaComponent extends SupportComponent {
  /** 予約詳細へボタン押下時イベントのためのOutput */
  @Output()
  returnToMyBooking: EventEmitter<string> = new EventEmitter<string>();

  /** ASW TOPへボタン押下時イベントのためのOutput */
  @Output()
  returnToAswTop: EventEmitter<void> = new EventEmitter<void>();

  constructor(private _common: CommonLibService, private _changeDetector: ChangeDetectorRef) {
    super(_common);
  }
  /** 画面初期化処理 */
  init() {
    // 画面サイズチェック開始
    this.subscribeService(
      'BookingCompletedButtonAreaResizeEvent',
      fromEvent(window, 'resize').pipe(throttleTime(500)),
      this._resizeEvent
    );
  }

  /** 画面終了時処理 */
  destroy() {}

  /** 画面更新時処理 */
  reload() {}

  /**
   * 予約詳細へボタンのクリックイベント
   */
  clickGoToMyBookingEvent() {
    this.returnToMyBooking.emit('');
  }

  /**
   * Asw Topへボタンのクリックイベント
   */
  clickGoToAswTopEvent() {
    this.returnToAswTop.emit();
  }

  /** 画面サイズ判定(PC) */
  public isPC = isPC();

  /** 画面サイズ比較用変数(PC) */
  public isPCPre = this.isPC;

  /** 画面サイズチェック用関数 */
  private _resizeEvent = () => {
    this.isPCPre = this.isPC;
    this.isPC = isPC();
    if (this.isPCPre !== this.isPC) {
      this._changeDetector.markForCheck();
    }
  };
}
