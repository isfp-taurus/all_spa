import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { SupportComponent } from '@lib/components/support-class';
import { CommonLibService } from '@lib/services';
import { PaymentDetailsBreakdownItemData } from './payment-details-breakdown-item/payment-details-breakdown-item.state';
import { AwardDetails } from '../plan-review-payment-details.state';

/**
 * 支払情報詳細モーダル 下部　内訳部分
 */
@Component({
  selector: 'asw-payment-details-breakdown',
  templateUrl: './payment-details-breakdown.component.html',
  styleUrls: ['./payment-details-breakdown.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentDetailsBreakdownComponent extends SupportComponent {
  constructor(private _common: CommonLibService) {
    super(_common);
  }

  @Input() data: Array<PaymentDetailsBreakdownItemData> = [];

  @Input() isCanada = false;
  @Input() isMalaysia = false;

  // 税金マスタから取得してきた文言
  @Input() mTaxMsgs: { [key: string]: string } = {};

  /** 特典データ */
  @Input() paymentDetailsAwardData?: AwardDetails;

  init(): void {}

  reload(): void {}

  destroy(): void {}
}
