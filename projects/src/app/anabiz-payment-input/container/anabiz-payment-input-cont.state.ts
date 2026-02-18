import { RegisterCodeType } from '@app/payment-input';
import { MCountryPosByContact } from '@common/interfaces';
import { MCountry, MCountryPos } from '@common/interfaces/master/m_country';
import { MPaymentInformation } from '@common/interfaces/master/m_payment_information';
import { FareConditionsState } from '@common/store';
import { LOAD_MASTER_LIST, MasterStoreKey } from '@conf/asw-master.config';
import { MOffice } from '@lib/interfaces/m_office';
import { GetOrderResponse } from 'src/sdk-servicing/model/getOrderResponse';

/**
 * ANA Biz搭乗者情報
 */
export interface AnaBizPassengerInfo {
  id?: string;
  name?: string;
  companyManagementCode1?: string; //企業用管理コード1
  companyManagementCode2?: string; //企業用管理コード2
  companyManagementCode3?: string; //企業用管理コード3
  companyManagementCode4?: string; //企業用管理コード4
  showCode1?: boolean;
  showCode2?: boolean;
  showCode3?: boolean;
  showCode4?: boolean;
}

/**
 * クレジットカード情報
 */
export interface AnabizCreditCardInformation {
  selectedCreditCard?: string; // 選択中のクレジットカード
  cardNumber?: string; // カード番号
  expiryDate?: string; // 有効期限
  holderName?: string; // カード名義人
  isUatpCard?: boolean; // UATPカード選択識別子
  securityCode?: string; // CVV
  cardHolder?: string; // カード名義
  mailAddress?: string; // 名義人メールアドレス
  confirmmailAddress?: string; // 名義人メールアドレス確認
  phoneCountry?: string; // 電話番号国
  countryNumber?: string; // 電話番号国番号
  isSkyCoin?: boolean; //SKYコイン併用識別子
  phoneNumber?: string; // 電話番号
  isCardUpdate?: boolean; // 予約基本情報カード情報更新チェック識別子
}

export function initAnabizCreditCardInformation(): AnabizCreditCardInformation {
  return {};
}

/**
 * クレジットカード基本情報
 */
export interface AnabizBasicCardInfo {
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
export interface AnabizCardHolderInfo {
  email?: string;
  phone?: AnabizPhoneSelectData;
}

export function initAnabizCardHolderInfo(): AnabizCardHolderInfo {
  return {
    email: '',
    phone: {
      phoneCountry: '',
      countryPhoneExtension: '',
      number: '',
    },
  };
}

export interface AnabizPhoneSelectData {
  phoneCountry: string;
  countryPhoneExtension: string;
  number: string;
}

// マスタデータ
export interface AnabizPaymentInputMasterData {
  paymentInformations: Array<MPaymentInformation>;
  countries: Array<MCountry>;
  offices: Array<MOffice>;
  posCountry: MCountryPosByContact;
  posCountryJp: Array<MCountryPos>;
}

/**
 * ANABIZ支払情報入力で使用するキャッシュ情報取得
 * @returns 支払情報入力で使用するキャッシュ情報
 */
export function getAnabizPaymentInformationRequestMasterKey(lang: string) {
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
  /** 選択中支払方法 */
  currentPaymentMethod?: string;
};

/**
 * 動的文言に渡すパラメータ
 * @param getOrderReply PNR情報取得レスポンス
 * @param fareConditionsReply 運賃ルール・手荷物情報取得レスポンス
 * @param pageContext 画面情報JSON
 */
export interface AnabizPaymentInputDynamicParams {
  getOrderReply?: GetOrderResponse;
  fareConditionsReply?: FareConditionsState;
  pageContext?: DisplayInfoJSON;
}
export function defaultAnabizPaymentInputDynamicParams(): AnabizPaymentInputDynamicParams {
  return {
    getOrderReply: undefined,
    fareConditionsReply: undefined,
    pageContext: {
      currentPaymentMethod: '',
    },
  };
}
