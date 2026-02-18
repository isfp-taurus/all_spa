export interface PaymentInputPaymentMethodsData {
  // SP支払方法変更モード判定
  isChangePaymentMethod: boolean;
  // SPクレジットカード変更モード判定
  isChangeCreditCard: boolean;
  // いつもの支払い方法登録チェック
  isSaveAsUsualChecked: boolean;
  // 選択支払い方法
  selectedPaymentMethod: string;
}

export function initPaymentInputPaymentMethodsData(): PaymentInputPaymentMethodsData {
  return {
    isChangePaymentMethod: false,
    isChangeCreditCard: false,
    isSaveAsUsualChecked: false,
    selectedPaymentMethod: 'CD',
  };
}

export interface PaymentInputPaymentMethodsParts {
  // 選択支払い方法
  selectedPaymentMethod: string;
}

export function initPaymentInputPaymentMethodsParts(): PaymentInputPaymentMethodsParts {
  return {
    selectedPaymentMethod: 'CD',
  };
}
