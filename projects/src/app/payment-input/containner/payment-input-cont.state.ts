import {
  MCountry,
  MCountryPos,
  MCountryPosByContact,
  MListData,
  ShareholderCouponsType,
  ApiErrorMap,
} from '@common/interfaces';
import { MBankWellnet } from '@common/interfaces/common/m_bank_wellnet';
import { MPaymentInformation } from '@common/interfaces/master/m_payment_information';
import { MOffice } from '@lib/interfaces';
import { GetOrderResponse, Traveler, Type1 } from 'src/sdk-servicing';
import { RegisteredCardTypeEnum } from '../sub-components/payment-input-common/payment-input-card-selecting';
import { FareConditionsState } from '@common/store';
import { GetAwardUsersState } from '@lib/store';
import { BehaviorSubject } from 'rxjs';

// 予約詳細画面へ連携する検索方法選択
export const SEARCH_METHOD_SELECTION = 'order'; // 予約番号で検索
// 予約詳細画面へ連携する連携サイトID
export const COLLABORAITION_SITE_ID = 'ALL_APP'; // ASW内の他アプリからの遷移

/**
 * 画面情報
 */
export interface PaymentInputScreenEntryInfo {
  selectedPaymentMethod: string; // 選択中支払方法
  isReservationOnly: boolean; // 予約のみ識別子
  availableReservationsOnly: boolean; // 予約のみ利用可否識別子
  isWaitlisted: boolean; // 空席待ち予約識別子
  prevPaymentMethod: string; // 変更前支払方法
  isKeepMyFare: boolean; // (未使用) Keep My Fare選択識別子
  creditCardInformation: CreditCardInformation; // クレジットカード情報
  isShowShareholderCouponsArea: boolean; // 株主優待情報表示
  shareholderCoupons: Array<ShareholderCouponsType>; // 株主優待情報
}
/**
 * クレジットカード情報
 */
export interface CreditCardInformation {
  selectedCreditCard: string; // 選択中のクレジットカード
  cardNumber: string; // カード番号
  expiryDate: string; // 有効期限
  holderName: string; // カード名義人
  isUatpCard: boolean; // UATPカード選択識別子
  securityCode: string; // CVV
  cardHolder: string; // カード名義
  mailAddress: string; // 名義人メールアドレス
  confirmmailAddress: string; // 名義人メールアドレス確認
  phoneCountry: string; // 電話番号国
  countryNumber: string; // 電話番号国番号
  phoneNumber: string; // 電話番号
  issueReceipt: string; // 領収証発行名義人
}

export function screenEntryData(): PaymentInputScreenEntryInfo {
  return {
    selectedPaymentMethod: '',
    isReservationOnly: false,
    availableReservationsOnly: false,
    isWaitlisted: false,
    prevPaymentMethod: '',
    isKeepMyFare: false,
    isShowShareholderCouponsArea: false,
    shareholderCoupons: [],
    creditCardInformation: {
      selectedCreditCard: RegisteredCardTypeEnum.NewCard,
      cardNumber: '',
      expiryDate: '',
      holderName: '',
      isUatpCard: false,
      securityCode: '',
      cardHolder: '',
      mailAddress: '',
      confirmmailAddress: '',
      phoneCountry: '',
      countryNumber: '',
      phoneNumber: '',
      issueReceipt: '',
    },
  };
}

// マスタデータ
export interface PaymentInputMasterData {
  paymentInformations: Array<MPaymentInformation>;
  countries: Array<MCountry>;
  offices: Array<MOffice>;
  banks: Array<MBankWellnet>;
  listData: Array<MListData>;
  posCountry: MCountryPosByContact;
  posCountryJp: Array<MCountryPos>;
}

/**
 * ANA SKYコイン情報
 */
export interface AnaSkyCoinInfo {
  travelerId?: string; // 搭乗者ID
  travelerName?: string; // 搭乗者名
  ticketPrice?: number; // 充当可能上限コイン
  usageCoin?: number; // 利用額入力欄
}

/**
 * 前画面引継ぎ情報
 */
export interface PreviousScreenHandoverInformation {
  orderId: string;
  credential: {
    firstName: string;
    lastName: string;
  };
}

export function initPreviousScreenHandoverInformation(): PreviousScreenHandoverInformation {
  return {
    orderId: '',
    credential: {
      firstName: '',
      lastName: '',
    },
  };
}

/**
 * クレジットカード情報
 */
export interface PaymentInputCardInfo {
  uatpCard?: boolean;
  cardNumber?: string;
  cardExpiryDate?: string;
  cvv?: string;
  ownerName?: string;
  reservation?: boolean;
}

/**
 * 名義人情報
 */
export interface PaymentInputCardHolderInfo {
  email?: string;
  phone?: PaymentInputPhoneSelectData;
}

export function initHolderInfo(): PaymentInputCardHolderInfo {
  return {
    email: '',
    phone: initPhoneSelectData(),
  };
}

export interface PaymentInputPhoneSelectData {
  registerCode?: RegisterCodeType;
  countryPhoneCode?: string;
  countryPhoneExtension: string;
  number: string;
}

export function initPhoneSelectData(): PaymentInputPhoneSelectData {
  return {
    registerCode: '0',
    countryPhoneCode: '',
    countryPhoneExtension: '',
    number: '',
  };
}

export type RegisterCodeType = '0' | '1';

export function PaymentInputInitMOffice(): MOffice {
  return {
    office_code: '',
    pos_country_code: '',
    dummy_office_flag: false,
    connection_kind: '',
    meta_connection_kind: '',
    content_connection_kind: '',
    promotion_available_flag: false,
    booking_type: '',
    currency_code: '',
    third_language_code: '',
    pos_lh_site: '',
    lh_third_language_code: '',
    initial_region_code: '',
    time_zone_airport_code: '',
    sms_send_select_initial: false,
    available_ensighten_tag: false,
    card_brand_pattern: '',
    paypal_available_flag: false,
    last_modification_date_time: '',
  };
}

/**
 * 支払情報入力で使用するキャッシュ情報取得
 * @returns 支払情報入力で使用するキャッシュ情報
 */
export function getPaymentInformationRequestMasterKey(lang: string) {
  return [
    {
      key: 'PaymentInformation_All',
      fileName: 'PaymentInformation_All',
    },
    {
      key: 'Country_All',
      fileName: 'Country_All',
    },
    {
      key: 'office_all',
      fileName: 'Office_All',
    },
    {
      key: 'm_bank',
      fileName: 'm_bank',
    },
    {
      key: `m_bank_i18n-${lang}`,
      fileName: `m_bank_i18n/${lang}`,
    },
    {
      key: 'ListData_All',
      fileName: 'ListData_All',
    },
    {
      key: 'Country_WithPosCountryByContactTelNumberCountryFlg',
      fileName: `Country_WithPosCountryByContactTelNumberCountryFlg_${lang}`,
    },
    {
      key: 'Country_CountryI18n_All',
      fileName: `Country_CountryI18n_All_${lang}`,
    },
  ];
}

/** 画面情報JSON */
export type DisplayInfoJSON = {
  /** 利用可能支払方法リスト */
  availablePaymentMethods?: string[];
  /** 選択中支払方法 */
  currentPaymentMethod?: string;
  /** 検索条件(運賃情報.MixedCabin選択有無) */
  flightCondition?: { fare: { isMixedCabin: boolean } };
  /** 検索条件有無 */
  hasSearchCriteria?: boolean;
  /** Keep my fare適用中フラグ */
  isKeepMyFare?: boolean;
};

/**
 * 動的文言に渡すパラメータ
 * @param getOrderReply PNR情報取得レスポンス
 * @param fareConditionsReply 運賃ルール・手荷物情報取得レスポンス
 * @param getAwardUserReply 特典情報レスポンス
 * @param pageContext 画面情報JSON
 */
export interface PaymentInputDynamicParams {
  getOrderReply?: GetOrderResponse;
  fareConditionsReply?: FareConditionsState;
  getAwardUserReply?: GetAwardUsersState;
  pageContext?: DisplayInfoJSON;
}
export function defaultPaymentInputDynamicParams(): PaymentInputDynamicParams {
  return {
    getOrderReply: undefined,
    fareConditionsReply: undefined,
    getAwardUserReply: undefined,
    pageContext: {
      availablePaymentMethods: [],
      currentPaymentMethod: '',
      flightCondition: { fare: { isMixedCabin: false } },
      hasSearchCriteria: false,
      isKeepMyFare: false,
    },
  };
}

export const dynamicSubject = new BehaviorSubject<PaymentInputDynamicParams>(defaultPaymentInputDynamicParams());
