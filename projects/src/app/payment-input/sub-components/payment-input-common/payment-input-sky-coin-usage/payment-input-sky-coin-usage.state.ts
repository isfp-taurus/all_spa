import { AnaSkyCoinInfo } from '../../../container/payment-input-cont.state';
/**
 * Skyコイン情報データ
 * @param   usageCoin Skyコイン利用額
 */
export interface PaymentInputRequestPaymentInputSkyCoinUsageData {
  usageCoin: Array<AnaSkyCoinInfo>;
  validation: boolean;
}
export function initPaymentInputSkyCoinUsageData(): PaymentInputRequestPaymentInputSkyCoinUsageData {
  const ret: PaymentInputRequestPaymentInputSkyCoinUsageData = {
    usageCoin: [],
    validation: false,
  };
  return ret;
}

/**
 * Skyコイン情報データ
 * @param   usageCoin Skyコイン利用額
 */
export interface PaymentInputRequestPaymentInputSkyCoinUsageParts {
  anaSkyCoinInfo: Array<AnaSkyCoinInfo>;
  selectedPaymentMethod: string;
}
export function initPaymentInputSkyCoinUsageParts(): PaymentInputRequestPaymentInputSkyCoinUsageParts {
  return {
    anaSkyCoinInfo: [],
    selectedPaymentMethod: '',
  };
}
