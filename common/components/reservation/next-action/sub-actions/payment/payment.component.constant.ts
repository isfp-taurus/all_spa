import { GetOrderResponseDataNextActionsOfflinePaymentDetails } from 'src/sdk-servicing';

/** 払込 - 銀行 */
const PaymentMethod_Bank = GetOrderResponseDataNextActionsOfflinePaymentDetails.PaymentMethodEnum.Bank;
/** 払込 - コンビニ */
const PaymentMethod_ConvinienceStore =
  GetOrderResponseDataNextActionsOfflinePaymentDetails.PaymentMethodEnum.ConvinienceStore;
/** 払込 - Pay-easy */
const PaymentMethod_Payeasy = GetOrderResponseDataNextActionsOfflinePaymentDetails.PaymentMethodEnum.Payeasy;

/** 画面レイアウト: 3-10-5-1 */
export const PAYMENT_GUIDE_LABEL_EXPIRED_MONGON_VALUES = {
  [PaymentMethod_Bank]: ['message.expiredInternetBanking', ''],
  [PaymentMethod_ConvinienceStore]: ['message.expiredConvenience', ''],
  [PaymentMethod_Payeasy]: ['label.expiredPayEasyheadline', ''],
  '': ['', ''],
};

/** 画面レイアウト: 3-10-5 */
export const PAYMENT_GUIDE_LABEL_NON_EXPIRED_MONGON_VALUES = {
  [PaymentMethod_Bank]: ['label.totalPayment.internetBanking', 'reader.totalPayment.internetBanking'],
  [PaymentMethod_ConvinienceStore]: ['label.convinienceStore1', 'reader.convinienceStore'],
  [PaymentMethod_Payeasy]: ['label.pleaseCompletePurchase', ''],
  '': ['', ''],
};

/** 画面レイアウト_文言ID: これから支払う総額 */
export const TOTAL_AMOUNT_LABEL_MONGON_VALUES = {
  [PaymentMethod_Bank]: 'label.totalAmount',
  [PaymentMethod_ConvinienceStore]: 'label.totalPayment.convenience',
  [PaymentMethod_Payeasy]: 'label.paymentTotalAmount',
  '': '',
};

/** 画面レイアウト_文言ID: 払込期限ラベル */
export const PAYMENT_DEADLINE_LABEL_MONGON_VALUES = {
  [PaymentMethod_Bank]: 'label.paymentDueDate',
  [PaymentMethod_ConvinienceStore]: 'label.paymentDueDate',
  [PaymentMethod_Payeasy]: 'label.paymentDueDate',
  '': '',
};

/** 画面レイアウト_文言ID: 払込方法 */
export const PAYMENT_METHOD_LABEL_MONGON_VALUES = {
  [PaymentMethod_Bank]: 'label.paymentMethod.internetBanking',
  [PaymentMethod_ConvinienceStore]: 'label.paymentMethod.convenience',
  [PaymentMethod_Payeasy]: 'label.paymentMethod',
  '': '',
};
export const PAYMENT_METHOD_MONGON_VALUES = {
  [PaymentMethod_Bank]: 'label.internetBanking',
  [PaymentMethod_ConvinienceStore]: 'label.convenienceStore',
  [PaymentMethod_Payeasy]: 'label.payeasy',
  '': '',
};
