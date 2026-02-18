import { LModalContentsWidthType, ModalType } from '@lib/components';
import { ModalBlockParts } from '@lib/services';
import { PaymentDetailsComponent } from './payment-details.component';

/**
 * 支払詳細モーダル　ペイロード
 */
export interface PaymentDetailsPayload {
  /** 特典必要マイル総数 */
  totalMileage?: number;
  /** 特典旅客毎マイル数 */
  paxMileage?: number;
  /** 特典PNRフラグ */
  isAwardBooking?: boolean;
}

export interface AwardDetails {
  isAwardBooking?: boolean;
  sumRequiredMiles?: number;
  paxRequiredMiles?: number;
}

/**
 * 支払詳細モーダルを開く際のパラメータ、payloadの設定は各自で行う
 * 例：
 * const part = paymentDetailsModalParts;
 *  part.payload = {
 *    amountType: PaymentDetailsSummaryAmountType.DIFF,
 *    promotionCode:"123",
 *   } as PaymentDetailsPayload;
 *  this.modal.showSubModal(part);
 *}
 */
export function defaultPaymentDetailsModalParts(): ModalBlockParts {
  return {
    id: 'paymentDetailsModalParts',
    block: PaymentDetailsComponent,
    closeBackEnable: true,
    type: ModalType.TYPE2,
    modalWidth: LModalContentsWidthType.MODAL_PC_W1000,
  };
}
