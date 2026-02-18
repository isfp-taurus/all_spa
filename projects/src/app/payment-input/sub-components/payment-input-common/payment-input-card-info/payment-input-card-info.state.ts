import { RegisteredCardTypeEnum } from '../payment-input-card-selecting/payment-input-card-selecting.state';
/**
 * クレジットカード情報データ
 * @param uatpCard UATPカード選択チェック
 * @param cardNumber クレジットカード番号
 * @param cardExpiryDate カード有効期限
 * @param cvv CVV
 * @param cardName クレジットカード名義
 * @param reservation 予約基本情報のクレジットカード登録・更新チェック
 * @param email 名義人メールアドレス
 * @param emailAgain 名義人メールアドレス確認
 * @param phoneCountryNumber 電話番号の国番号
 * @param phoneNumber 電話番号
 */
export interface PaymentInputRequestCardInformationData {
  uatpCard: boolean;
  cardNumber: string;
  cardExpiryDate: string;
  cvv: string;
  ownerName: string;
  reservation: boolean;
  email: string;
  emailAgain: string;
  phoneCountryNumber: string;
  phoneNumber: string;
  validation: boolean;
  selectedCard: RegisteredCardTypeEnum;
}
export function initialPaymentInputRequestCardInformationData(): PaymentInputRequestCardInformationData {
  const ret: PaymentInputRequestCardInformationData = {
    uatpCard: false,
    cardNumber: '',
    cardExpiryDate: '',
    cvv: '',
    ownerName: '',
    reservation: false,
    email: '',
    emailAgain: '',
    phoneCountryNumber: '',
    phoneNumber: '',
    validation: false,
    selectedCard: RegisteredCardTypeEnum.NewCard,
  };
  return ret;
}

/**
 * クレジットカード情報データ
 * @param uatpCard UATP
 * @param cardNumber クレジットカード番号
 * @param cardExpiryDate 有効期限
 * @param securityCode CVV
 * @param securityCodeDisabled CVV
 * @param cardName カード名義
 * @param reservation いつものカード
 */
export interface PaymentInputRequestCardInformationParts {
  uatpCard: boolean;
  cardNumber: string;
  cardExpiryDate: string;
  securityCode: string;
  securityCodeDisabled: string;
  cardName: string;
  reservation: boolean;
}
export function initialPaymentInputRequestCardInformationParts(): PaymentInputRequestCardInformationParts {
  const ret: PaymentInputRequestCardInformationParts = {
    uatpCard: false,
    cardNumber: '',
    cardExpiryDate: '',
    securityCode: '',
    securityCodeDisabled: '',
    cardName: '',
    reservation: false,
  };
  return ret;
}

export type CardBrandEnum = 'VI' | 'CA' | 'JC' | 'AX' | 'DS' | 'DC';
export const CardBrandEnum = {
  Visa: 'VI' as CardBrandEnum,
  MasterCard: 'CA' as CardBrandEnum,
  JCB: 'JC' as CardBrandEnum,
  AmericanExpress: 'AX' as CardBrandEnum,
  Discover: 'DS' as CardBrandEnum,
  DinersClub: 'DC' as CardBrandEnum,
};

// カードブランドロゴマップの定義
export type CardBrandImageMapType = Map<CardBrandEnum, string>;
export const CardBrandImageMap: CardBrandImageMapType = new Map<CardBrandEnum, string>()
  .set(CardBrandEnum.Visa, 'cardlogo_visa')
  .set(CardBrandEnum.MasterCard, 'cardlogo_mastercard')
  .set(CardBrandEnum.JCB, 'cardlogo_jcb')
  .set(CardBrandEnum.AmericanExpress, 'cardlogo_americanexpress')
  .set(CardBrandEnum.Discover, 'cardlogo_discover')
  .set(CardBrandEnum.DinersClub, 'cardlogo_dinersclub');
