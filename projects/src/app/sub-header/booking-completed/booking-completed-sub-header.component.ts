/**
 * サブヘッダー
 */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { CommonLibService } from '@lib/services';
import { SupportComponent } from '@lib/components/support-class';
import { BookingCompletedSubHeaderInformationStoreService } from '@common/services';
import { isPC, isSP, isTB } from 'src/lib/helpers';

/**
 * 予約購入完了 サブヘッダー
 *
 */
@Component({
  selector: 'asw-booking-completed-sub-header',
  templateUrl: './booking-completed-sub-header.component.html',
  styleUrls: [],
  providers: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingCompletedSubHeaderComponent extends SupportComponent {
  /** 画面タイトル */
  public displayTitle: string = '';

  /** ブレッドクラム表示判定 */
  public isBreadcrumbDisplay: boolean = false;

  /** デバイス判定のための変数 */
  public isPC = false; // PCかどうか
  public isTB = false; // タブレットかどうか
  public isSP = false; // スマホかどうか

  /** ブレッドクラムのステップ数保持のための変数 */
  public stepNum: number = 5;
  public currentStepNum: number = 5;

  constructor(
    private _common: CommonLibService,
    private _bookingCompletedSubHeaderInformationStoreService: BookingCompletedSubHeaderInformationStoreService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    super(_common);
  }

  reload(): void {}
  init(): void {
    this.subscribeService(
      'BookingCompletedSubHeaderComponent bookingCompletedSubHeaderInformation',
      this._bookingCompletedSubHeaderInformationStoreService.getBookingCompletedSubHeaderInformation$(),
      (data) => {
        this.displayTitle = data.displayTitle;
        this.isBreadcrumbDisplay = data.isBreadcrumbDisplay;
        this.changeDetectorRef.markForCheck();
      }
    );

    // 該当する端末にtrueを設定する
    this.isPC = isPC();
    this.isTB = isTB();
    this.isSP = isSP();
  }
  destroy(): void {}
}
