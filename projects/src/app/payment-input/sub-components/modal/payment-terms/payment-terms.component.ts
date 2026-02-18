import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { SupportModalBlockComponent } from '@lib/components/support-class';
import { CommonLibService } from '@lib/services';
import { PaymentTermsPayload } from './payment-terms.state';

/**
 * 支払規約モーダル
 */
@Component({
  selector: 'asw-payment-terms',
  templateUrl: './payment-terms.component.html',
  styleUrls: ['./payment-terms.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentTermsComponent extends SupportModalBlockComponent {
  /** メッセージ */
  message: string = '';

  constructor(_common: CommonLibService, public changeDetectorRef: ChangeDetectorRef) {
    super(_common);
  }

  /** ペイロード定義 */
  public override payload: PaymentTermsPayload = {
    message: '',
  };

  /**
   * 初期表示処理
   */
  init(): void {
    // ペイロード取得
    this.message = this.payload.message;
  }

  reload(): void {}

  destroy(): void {}

  /**
   * 閉じる押下
   */
  clickClose() {
    this.close();
  }
}
