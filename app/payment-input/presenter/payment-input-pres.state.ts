import {
  PaymentInputRequestCreditCardData,
  initPaymentInputRequestCreditCardData,
  PaymentInputRequestCreditCardParts,
  initPaymentInputRequestCreditCardParts,
} from '../sub-components/payment-input-credit-card/payment-input-credit-card.state';
import {
  PaymentInputPaymentMethodsData,
  initPaymentInputPaymentMethodsData,
  PaymentInputPaymentMethodsParts,
  initPaymentInputPaymentMethodsParts,
} from '../sub-components/payment-input-payment-methods/payment-input-payment-methods.state';
import {
  PaymentInputInternetBankingData,
  initPaymentInputInternetBankingData,
  PaymentInputInternetBankingParts,
  initPaymentInputInternetBankingParts,
} from '../sub-components/payment-input-internet-banking/payment-input-internet-banking.state';
import {
  PaymentInputSkyCoinData,
  initPaymentInputSkyCoinData,
  PaymentInputSkyCoinParts,
  initPaymentInputSkyCoinParts,
} from '../sub-components/payment-input-sky-coin/payment-input-sky-coin.state';
import {
  PaymentAmountData,
  initPaymentAmountData,
  PaymentAmountParts,
  initPaymentAmountParts,
} from '../sub-components/payment-input-payment-amount/payment-input-payment-amount.state';
import { PaymentMethodsType } from '@common/interfaces/common/payment-methods';
import {
  AnaSkyCoinInfo,
  PaymentInputCardInfo,
  PaymentInputCardHolderInfo,
  PreviousScreenHandoverInformation,
} from '../container';
import { RegisteredCardTypeEnum } from '../sub-components';
import { ShareholderCouponsType } from '@common/interfaces';

/**
 * SubComponentModelComponent用下位コンポーネントに渡す情報
 * Inputがすでに定義されているため中身は空
 */
export interface PaymentInputPresParts {
  skyCoinParts: PaymentInputSkyCoinParts;
  creditCardParts: PaymentInputRequestCreditCardParts;
  paymentMethodsParts: PaymentInputPaymentMethodsParts;
  InternetBankingParts: PaymentInputInternetBankingParts;
  paymentAmountParts: PaymentAmountParts;
}

export function initPaymentInputPresParts(): PaymentInputPresParts {
  return {
    skyCoinParts: initPaymentInputSkyCoinParts(),
    creditCardParts: initPaymentInputRequestCreditCardParts(),
    paymentMethodsParts: initPaymentInputPaymentMethodsParts(),
    InternetBankingParts: initPaymentInputInternetBankingParts(),
    paymentAmountParts: initPaymentAmountParts(),
  };
}

/**
 * SubComponentModelComponent用上位コンポーネントに渡す情報
 */
export interface PaymentInputPresData {
  paymentMethodsData: PaymentInputPaymentMethodsData;
  internetBankingData: PaymentInputInternetBankingData;
  creditCardData: PaymentInputRequestCreditCardData;
  skyCoinData: PaymentInputSkyCoinData;
  paymentAmountData: PaymentAmountData;
}

export function initPaymentInputPresData(): PaymentInputPresData {
  const creditCardData = initPaymentInputRequestCreditCardData();
  const responseData = {
    paymentMethodsData: initPaymentInputPaymentMethodsData(),
    internetBankingData: initPaymentInputInternetBankingData(),
    creditCardData: creditCardData,
    skyCoinData: initPaymentInputSkyCoinData(),
    paymentAmountData: initPaymentAmountData(),
  };

  responseData.skyCoinData.skyCoinBallancesData = responseData.creditCardData.skyCoinBallancesData;
  responseData.skyCoinData.skyCoinSummaryData = responseData.creditCardData.skyCoinSummaryData;
  responseData.skyCoinData.skyCoinUsageData = responseData.creditCardData.skyCoinUsageData;

  return responseData;
}

/**
 * 搭乗者情報が配列になるので配列にしやすいよう定義
 */
export interface PassengerInformationRequestPassengerInformationDataGroup {
  data: PaymentInputRequestCreditCardData;
}

/**
 * 画面側購入発券処理実行に必要なパラメータ
 */
export interface PaymentInputPresTicketingServiceParam {
  isKeepMyFare: boolean;
  selectedPaymentMethod: PaymentMethodsType;
  selectedCard: RegisteredCardTypeEnum;
  totalUseCoin: number;
  bankCode: string;
  issueReceipt: string;
  isCreditCardCombination: boolean;
  isSaveAsUsualChecked: boolean;
  isBankSaveAsUsualChecked: boolean;
  cardInfo: PaymentInputCardInfo;
  holderInfo: PaymentInputCardHolderInfo;
  /** FY25 予約のみ識別子*/
  isReservationOnly?: boolean;
  /** 空席待ち予約識別子 */
  isWaitlisted?: boolean;
  /** 株主優待情報 */
  isContainedShareholdersBenefitDiscountFare: boolean;
  shareholderCoupons?: Array<ShareholderCouponsType>;
  prevScreenInfo: PreviousScreenHandoverInformation;
}

export interface CardinalConfig {
  logging: {
    level: string;
  };
  payment: {
    view: string;
    framework: string;
    displayLoading: boolean;
    displayExitButton: boolean;
  };
}

export interface CardinalResponse {
  Validated: boolean;
  ErrorNumber: number;
  ErrorDescription: string;
  ActionCode: string;
  Payment?: {
    ExtendedData: {
      ChallengeCancel: string;
    };
  };
}

export interface PaymentInputSetupCompleteData {
  sessionId: string;
  modules: [
    {
      module: string;
      loaded: boolean;
    }
  ];
}

/**
 * 運賃ルールで読み込むキャッシュ
 * @param lang 言語キー
 * @returns
 */
export function getFareConditionsMasterKey(lang: string) {
  return [
    {
      key: 'mAirportI18NList' + `_${lang}`,
      fileName: 'm_airport_i18n' + '/' + lang,
    },
    {
      key: 'm_ff_priority_code_i18n' + `_${lang}`,
      fileName: 'm_ff_priority_code_i18n' + '/' + lang,
    },
  ];
}
