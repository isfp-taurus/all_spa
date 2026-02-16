/**
 * Skyコイン合計使用数データ
 * @param   totalPrice 支払総額
 * @param   totalUseCoin Skyコイン合計使用数
 */
export interface PaymentInputRequestPaymentInputSkyCoinSummaryData {
  totalPrice: number;
  totalUseCoin: number;
}
export function initPaymentInputSkyCoinSummaryData(): PaymentInputRequestPaymentInputSkyCoinSummaryData {
  const ret: PaymentInputRequestPaymentInputSkyCoinSummaryData = {
    totalPrice: 0,
    totalUseCoin: 0,
  };
  return ret;
}

/**
 * Skyコイン合計使用数パーツ
 * @param   totalPrice 支払総額
 * @param   totalPriceCurrency 支払総額通貨
 * @param   totalUseCoin Skyコイン合計使用数
 */
export interface PaymentInputRequestPaymentInputSkyCoinSummaryParts {
  totalPrice: number;
  totalPriceCurrency: string;
  totalUseCoin: number;
}
export function initPaymentInputSkyCoinSummaryParts(): PaymentInputRequestPaymentInputSkyCoinSummaryParts {
  return {
    totalPrice: 0,
    totalPriceCurrency: '',
    totalUseCoin: 0,
  };
}
