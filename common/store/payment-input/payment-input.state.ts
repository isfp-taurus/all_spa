import { PreviousScreenHandoverInformation } from '@app/payment-input';
import { AsyncStoreItem } from '@lib/store';

/**
 * PaymentInput model
 */
export interface PaymentInputModel {
  /** 前画面情報 */
  previousPage?: string;
  /** 画面情報更新要否 */
  isNeedRefresh?: boolean;
}

/**
 * 3DS認証結果情報
 */
export interface CardinalResultInfo {
  /** エラーコード */
  errorNumber?: number;
  /** エラー詳細 */
  errorDescription?: string;
  /** JWTトークン */
  jwtToken?: string;
  /** キャンセル判定 */
  challengeCancel?: string;
}

/**
 *  model details
 */
export interface PaymentInputStateDetails extends PaymentInputModel, AsyncStoreItem {}

/**
 * PaymentInput store state
 */
export interface PaymentInputState extends PaymentInputStateDetails, CardinalResultInfo {
  isInputError?: PaymentInputError;
  isChangePromotionCode?: boolean;
  promotionCodeErrorId?: string;
  isKeepMyFare?: boolean;
  previousScreenInfo?: PreviousScreenHandoverInformation;
  fareDiscountIds?: Array<string>;
}
export interface PaymentInputError {
  cardNumber?: boolean;
  cardExpiryDate?: boolean;
  securityCode?: boolean;
  cardName?: boolean;
  receiptName?: boolean;
  email?: boolean;
  emailAgain?: boolean;
  countryCode?: boolean;
  number?: boolean;
  bankName?: boolean;
  skyCoin?: boolean;
}

/**
 * Name of the PaymentInput Store
 */
export const PAYMENT_INPUT_STORE_NAME = 'paymentInput';

/**
 * PaymentInput Store Interface
 */
export interface PaymentInputStore {
  /** PaymentInput state */
  [PAYMENT_INPUT_STORE_NAME]: PaymentInputState;
}
