/**
 * Skyコイン残高データ
 * @param   skyCoinBalance Skyコイン残高
 * @param   mileBalance マイル残高
 */
export interface PaymentInputRequestPaymentInputSkyCoinBallancesData {
  skyCoinBalance: number;
  mileBalance: number;
}
export function initPaymentInputSkyCoinBallancesData(): PaymentInputRequestPaymentInputSkyCoinBallancesData {
  const ret: PaymentInputRequestPaymentInputSkyCoinBallancesData = {
    skyCoinBalance: 0,
    mileBalance: 0,
  };
  return ret;
}

/**
 * Skyコイン残高パーツ
 * @param   skyCoinBalance Skyコイン残高
 * @param   mileBalance マイル残高
 */
export interface PaymentInputRequestPaymentInputSkyCoinBallancesParts {
  skyCoinBalance: number;
  mileBalance: number;
}
export function initPaymentInputSkyCoinBallancesParts(): PaymentInputRequestPaymentInputSkyCoinBallancesParts {
  return {
    skyCoinBalance: 0,
    mileBalance: 0,
  };
}
