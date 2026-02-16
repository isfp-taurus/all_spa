/**
 * クレジットカード領収書発行名義情報
 */
export interface PaymentInputCreditCardReceiptData {
  issueReceipt: string;
  validation: boolean;
}

export function initPaymentInputCreditCardReceiptData(): PaymentInputCreditCardReceiptData {
  return {
    issueReceipt: '',
    validation: false,
  };
}

export interface PaymentInputCreditCardReceiptParts {
  issueReceipt: string;
}

export function initPaymentInputCreditCardReceiptParts(): PaymentInputCreditCardReceiptParts {
  return {
    issueReceipt: '',
  };
}
