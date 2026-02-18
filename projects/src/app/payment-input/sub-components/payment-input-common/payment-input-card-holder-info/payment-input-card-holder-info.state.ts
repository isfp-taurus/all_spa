import { ValidationErrors } from '@angular/forms';
import { MCountry } from '@common/interfaces';

export const PaymentInputCardHolderInfoConfirmEmailError: ValidationErrors = {
  'validate-email': {
    errorMsgId: 'E0461',
    params: {
      key: 0,
      value: 'label.confirmMailAddress',
    },
  },
};
export const PaymentInputCardHolderInfoConfirmEmailRequireError: ValidationErrors = {
  'validate-email-require': {
    errorMsgId: 'E0001',
    params: {
      key: 0,
      value: 'label.confirmMailAddress',
    },
  },
};

/**
 * クレジットカード名義人情報
 */
export interface PaymentInputCardHolderInfoData {
  email: string;
  countryCode: string;
  countryNumber: string;
  phoneNumber: string;
  validation: boolean;
}

export function initPaymentInputCardHolderInfoData(): PaymentInputCardHolderInfoData {
  return {
    email: '',
    countryCode: '',
    countryNumber: '',
    phoneNumber: '',
    validation: false,
  };
}

export interface PaymentInputCardHolderInfoParts {
  countryAll: Array<MCountry>;
  email: string;
  countryCode: string;
  phoneNumber: string;
}

export function initPaymentInputCardHolderInfoParts(): PaymentInputCardHolderInfoParts {
  return {
    countryAll: [],
    email: '',
    countryCode: '',
    phoneNumber: '',
  };
}
