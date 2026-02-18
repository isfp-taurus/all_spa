export interface PaymentInputInternetBankingData {
  //いつもの支払い方法登録チェック
  isSaveAsUsualChecked: boolean;
  //入力チェック
  isBankFormValid: boolean;
  //銀行コード
  bankCode: string;
}
export function initPaymentInputInternetBankingData(): PaymentInputInternetBankingData {
  return {
    isSaveAsUsualChecked: false,
    isBankFormValid: false,
    bankCode: '',
  };
}
export interface PaymentInputInternetBankingParts {
  //銀行コード
  bankCode: string;
}
export function initPaymentInputInternetBankingParts() {
  return {
    bankCode: '',
  };
}
