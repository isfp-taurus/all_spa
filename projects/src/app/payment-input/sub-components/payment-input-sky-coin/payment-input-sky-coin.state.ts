import {
  initPaymentInputSkyCoinBallancesData,
  PaymentInputRequestPaymentInputSkyCoinBallancesData,
  PaymentInputRequestPaymentInputSkyCoinBallancesParts,
  initPaymentInputSkyCoinBallancesParts,
} from '../payment-input-common/payment-input-sky-coin-ballances/payment-input-sky-coin-ballances.state';
import {
  initPaymentInputSkyCoinUsageData,
  PaymentInputRequestPaymentInputSkyCoinUsageData,
  PaymentInputRequestPaymentInputSkyCoinUsageParts,
  initPaymentInputSkyCoinUsageParts,
} from '../payment-input-common/payment-input-sky-coin-usage/payment-input-sky-coin-usage.state';
import {
  initPaymentInputSkyCoinSummaryData,
  PaymentInputRequestPaymentInputSkyCoinSummaryData,
  PaymentInputRequestPaymentInputSkyCoinSummaryParts,
  initPaymentInputSkyCoinSummaryParts,
} from '../payment-input-common/payment-input-sky-coin-summary/payment-input-sky-coin-summary.state';
import {
  PaymentInputCardHolderInfoData,
  initPaymentInputCardHolderInfoData,
  PaymentInputCardHolderInfoParts,
  initPaymentInputCardHolderInfoParts,
} from '../payment-input-common/payment-input-card-holder-info/payment-input-card-holder-info.state';
import {
  PaymentInputRequestCardInformationData,
  initialPaymentInputRequestCardInformationData,
  PaymentInputRequestCardInformationParts,
  initialPaymentInputRequestCardInformationParts,
} from '../payment-input-common/payment-input-card-info/payment-input-card-info.state';
import {
  PaymentInputCardSelectingData,
  initPaymentInputCardSelectingData,
  initPaymentInputCardSelectingParts,
  PaymentInputCardSelectingParts,
} from '../payment-input-common/payment-input-card-selecting/payment-input-card-selecting.state';

import {
  PaymentInputCreditCardReceiptData,
  initPaymentInputCreditCardReceiptData,
  PaymentInputCreditCardReceiptParts,
  initPaymentInputCreditCardReceiptParts,
} from '../payment-input-common/payment-input-credit-card-receipt/payment-input-credit-card-receipt.state';

/**
 * SKYコインコンポーネントデータ
 * @param cardInformationData クレジットカード情報コンポーネントデータ
 * @param cardHolderInfoData クレジットカード名義人情報コンポーネントデータ
 * @param skyCoinUsageData ANA SKYコイン 情報入力エリアコンポーネントコンポーネントデータ
 */
export interface PaymentInputSkyCoinData {
  cardSelectingData: PaymentInputCardSelectingData;
  cardInformationData: PaymentInputRequestCardInformationData;
  cardHolderInfoData: PaymentInputCardHolderInfoData;
  creditCardReceiptData: PaymentInputCreditCardReceiptData;
  skyCoinBallancesData: PaymentInputRequestPaymentInputSkyCoinBallancesData;
  skyCoinUsageData: PaymentInputRequestPaymentInputSkyCoinUsageData;
  skyCoinSummaryData: PaymentInputRequestPaymentInputSkyCoinSummaryData;
}

export function initPaymentInputSkyCoinData(): PaymentInputSkyCoinData {
  return {
    cardSelectingData: initPaymentInputCardSelectingData(),
    cardInformationData: initialPaymentInputRequestCardInformationData(),
    cardHolderInfoData: initPaymentInputCardHolderInfoData(),
    creditCardReceiptData: initPaymentInputCreditCardReceiptData(),
    skyCoinBallancesData: initPaymentInputSkyCoinBallancesData(),
    skyCoinUsageData: initPaymentInputSkyCoinUsageData(),
    skyCoinSummaryData: initPaymentInputSkyCoinSummaryData(),
  };
}

export interface PaymentInputSkyCoinParts {
  cardSelectingParts: PaymentInputCardSelectingParts;
  cardInformationParts: PaymentInputRequestCardInformationParts;
  cardHolderInfoParts: PaymentInputCardHolderInfoParts;
  creditCardReceiptParts: PaymentInputCreditCardReceiptParts;
  skyCoinBallancesParts: PaymentInputRequestPaymentInputSkyCoinBallancesParts;
  skyCoinUsageParts: PaymentInputRequestPaymentInputSkyCoinUsageParts;
  skyCoinSummaryParts: PaymentInputRequestPaymentInputSkyCoinSummaryParts;
}

export function initPaymentInputSkyCoinParts(): PaymentInputSkyCoinParts {
  return {
    cardSelectingParts: initPaymentInputCardSelectingParts(),
    cardInformationParts: initialPaymentInputRequestCardInformationParts(),
    cardHolderInfoParts: initPaymentInputCardHolderInfoParts(),
    creditCardReceiptParts: initPaymentInputCreditCardReceiptParts(),
    skyCoinBallancesParts: initPaymentInputSkyCoinBallancesParts(),
    skyCoinUsageParts: initPaymentInputSkyCoinUsageParts(),
    skyCoinSummaryParts: initPaymentInputSkyCoinSummaryParts(),
  };
}
