/**
 * コンポーネントデータ
 * @param appliedAamDiscountCode 適用済AAMプロモーションコード
 */
export interface PaymentAmountData {
  appliedAamDiscountCode?: string;
}

export function initPaymentAmountData(): PaymentAmountData {
  return {
    appliedAamDiscountCode: '',
  };
}

export interface PaymentAmountParts {
  appliedDiscountType: string;
  appliedAamDiscountCode?: string;
}

export function initPaymentAmountParts(): PaymentAmountParts {
  return {
    appliedDiscountType: '',
    appliedAamDiscountCode: '',
  };
}

export interface PaymentDetailsData {
  /** 特典必要マイル総数 */
  totalMileage?: number;
  /** 特典旅客毎マイル数 */
  paxMileage?: number;
  /** 特典PNRフラグ */
  isAwardBooking?: boolean;
}
