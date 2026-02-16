import { LModalContentsWidthType, ModalType } from '@lib/components';
import { ModalBlockParts } from '@lib/services';
import { PaymentDetailsSummaryAmountType } from './payment-details-summary/payment-details-summary.state';
import { PlanReviewPaymentDetailsComponent } from './plan-review-payment-details.component';

/**
 * 支払詳細モーダル　ペイロード
 * @param amountType 差分強調表示フラグ DEL:削除済み DIFF:差分強調 NONE:強調無し
 * @param totalMileage 必要マイル総数
 * @param paxMileage 旅客毎必要マイル数
 * @param isAwardBooking 特典予約フラグ
 */
export interface PaymentDetailsPayload {
  amountType: PaymentDetailsSummaryAmountType;
  totalMileage?: number;
  paxMileage?: number;
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
 * const parts = paymentDetailsModalParts();
 *  parts.payload = {
 *    amountType: PaymentDetailsSummaryAmountType.DIFF
 *   } as PaymentDetailsPayload;
 *  this.modal.showSubModal(part);
 *}
 */
export function paymentDetailsModalParts(): ModalBlockParts {
  return {
    id: 'paymentDetailsModalParts',
    block: PlanReviewPaymentDetailsComponent,
    closeBackEnable: false,
    type: ModalType.TYPE2,
    modalWidth: LModalContentsWidthType.MODAL_PC_W1000,
  };
}

/**
 * 支払情報詳細モーダルにて読み込むキャッシュ
 * @param lang 言語キー
 * @returns
 */
export function getPlanReviewPaymentDetailsMasterKey(lang: string) {
  return [
    {
      key: 'Tax_All_Lang',
      fileName: 'Tax_All_Lang',
    },
    {
      key: 'airport_all',
      fileName: 'Airport_All',
    },
  ];
}

/**
 * 搭乗者種別(PTC)毎の人数用静的文言キー
 */
export const travelerNumStaticMsgs: { [key: string]: string } = {
  ADT: 'label.passengerAdult',
  B15: 'label.passengerYoungAdult',
  CHD: 'label.passengerChild',
  INF: 'label.passengerInfant',
};
