import { PaymentInputCardInfo } from '@app/payment-input/container';

/**
 * カード選択情報Data
 * @param   creditCardInfo カード情報
 */
export interface PaymentInputCardSelectingData {
  creditCardInfo: PaymentInputCardInfo;
  selectedCard: RegisteredCardTypeEnum;
}
export function initPaymentInputCardSelectingData(): PaymentInputCardSelectingData {
  return {
    creditCardInfo: {
      uatpCard: false, // UATP
      cardNumber: '', // カード番号
      cardExpiryDate: '', // 有効期限
      cvv: '', // CVV
      ownerName: '', // 名義
      reservation: false, // 登録
    },
    selectedCard: RegisteredCardTypeEnum.NewCard,
  };
}

/**
 * カード選択情報Parts
 */
export interface PaymentInputCardSelectingParts {
  selectedPaymentMethod: string;
}

export function initPaymentInputCardSelectingParts(): PaymentInputCardSelectingParts {
  return {
    selectedPaymentMethod: '',
  };
}

export type RegisteredCardTypeEnum = 'newCard' | 'paymentCard1' | 'paymentCard2' | 'paymentCard3';
export const RegisteredCardTypeEnum = {
  NewCard: 'newCard' as RegisteredCardTypeEnum,
  PaymentCard1: 'paymentCard1' as RegisteredCardTypeEnum,
  PaymentCard2: 'paymentCard2' as RegisteredCardTypeEnum,
  PaymentCard3: 'paymentCard3' as RegisteredCardTypeEnum,
};

export type CreditCardTypeCodeEnum = '1' | '2' | '3';
export const CreditCardTypeCodeEnum = {
  CreditCard1: '1' as CreditCardTypeCodeEnum,
  CreditCard2: '2' as CreditCardTypeCodeEnum,
  CreditCard3: '3' as CreditCardTypeCodeEnum,
};
