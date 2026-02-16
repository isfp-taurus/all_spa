import { ApiErrorMap } from '@common/interfaces';
import {
  PassengerInformationRequestPassengerInformationData,
  PassengerInformationRequestPassengerInformationParts,
} from './passenger-information/passenger-information.state';
import { GetCartState } from '@common/store/get-cart/get-cart.state';
import { GetMemberInformationState } from '@lib/store';
import { ErrorCodeConstants } from '@conf/app.constants';

/**
 * 搭乗者情報が配列になるので配列にしやすいよう定義
 */
export interface PassengerInformationRequestPassengerInformationDataGroup {
  data: PassengerInformationRequestPassengerInformationData;
  parts: PassengerInformationRequestPassengerInformationParts;
}

/**
 * 搭乗者情報入力で使用するキャッシュ情報取得
 * @param lang 言語キー
 * @returns 搭乗者情報入力で使用するキャッシュ情報
 */
export function getPassengerInformationRequestMasterKey(lang: string) {
  return [
    { key: 'countryAll', fileName: 'Country_All' },
    { key: 'm_office', fileName: 'Office_All' },
    { key: 'langCodeConvert_All', fileName: 'LangCodeConvert_All' },
    { key: 'm_mileage_program_i18n_all', fileName: `m_mileage_program_i18n_all_${lang}` },
    {
      key: 'Country_WithPosCountryByContactTelNumberCountryFlg',
      fileName: `Country_WithPosCountryByContactTelNumberCountryFlg_${lang}`,
    },
    {
      key: 'Country_CountryI18n_All',
      fileName: `Country_CountryI18n_All_${lang}`,
    },
    {
      key: 'Country_WithPosCountryForSmsSendTelNumber',
      fileName: `Country_WithPosCountryForSmsSendTelNumber_${lang}`,
    },
    {
      key: 'Country_CountryI18n_All',
      fileName: `Country_CountryI18n_All_${lang}`,
    },
    { key: 'ListData_All', fileName: 'ListData_All' },
    { key: 'Property_ForAkamaiCache', fileName: 'Property_ForAkamaiCache' },
    { key: 'Airport_All', fileName: 'Airport_All' },
  ];
}
/**
 * 搭乗者更新APIのエラーレスポンスに対するエラーマップ
 */
export const PassengerInformationRequestApiErrorMap: ApiErrorMap = {
  [ErrorCodeConstants.ERROR_CODES.EBAZ000157]: {
    isRetryableError: false,
    errorMsgId: 'E0333',
  },
  [ErrorCodeConstants.ERROR_CODES.EBAZ000301]: {
    isRetryableError: true,
    errorMsgId: 'E0466',
  },
  [ErrorCodeConstants.ERROR_CODES.EBAZ000308]: {
    isRetryableError: true,
    errorMsgId: 'E0467',
  },
  [ErrorCodeConstants.ERROR_CODES.EBAZ000307]: {
    isRetryableError: true,
    errorMsgId: 'E0465',
  },
  [ErrorCodeConstants.ERROR_CODES.EBAZ000309]: {
    isRetryableError: true,
    errorMsgId: 'E0468',
  },
  [ErrorCodeConstants.ERROR_CODES.EBAZ000302]: {
    isRetryableError: true,
    errorMsgId: 'EA056',
  },
  [ErrorCodeConstants.ERROR_CODES.EBAZ000297]: {
    isRetryableError: true,
    errorMsgId: 'W1314',
  },
};

/**
 * 予約可否判断APIのエラーレスポンスに対するエラーマップ
 */
export const GetOrdersReservationAvailabilityApiErrorMap: ApiErrorMap = {
  [ErrorCodeConstants.ERROR_CODES.EBAZ000278]: {
    isRetryableError: true,
    errorMsgId: 'E0333', // カート取得失敗
  },
  [ErrorCodeConstants.ERROR_CODES.EIFA000006]: {
    isRetryableError: true,
    errorMsgId: 'EA015', // 該当データなし
  },
  [ErrorCodeConstants.ERROR_CODES.EIFA000007]: {
    isRetryableError: true,
    errorMsgId: 'EA023', // 会員が存在しない
  },
  [ErrorCodeConstants.ERROR_CODES.EIFA000011]: {
    isRetryableError: true,
    errorMsgId: 'EA016', // 会員が存在しない
  },
  [ErrorCodeConstants.ERROR_CODES.EIFA000008]: {
    isRetryableError: true,
    errorMsgId: 'EA019', // 退会会員
  },
  [ErrorCodeConstants.ERROR_CODES.EIFA000009]: {
    isRetryableError: true,
    errorMsgId: 'EA058', // マイル残高不足
  },
  [ErrorCodeConstants.ERROR_CODES.EIFA000010]: {
    isRetryableError: true,
    errorMsgId: 'EA026', // 1SEG1PAX以外で連携されてきた場合
  },
  [ErrorCodeConstants.ERROR_CODES.FIFA000001]: {
    isRetryableError: false,
    errorMsgId: 'EA019', // ifly接続エラー(想定外エラー)
  },
};

/**
 * 動的文言に渡すパラメータ
 * @param getCartReply カート情報
 * @param getMemberInformationReply 会員情報
 * @param mediValdYmd 精神障害者福祉手帳の有効期限 YYYY-MM-DD
 */
export interface PassengerInformationRequestDynamicParams {
  getCartReply?: GetCartState;
  getMemberInformationReply?: GetMemberInformationState;
  getMemberInformationReplyMediValdYmd?: string;
}
export function defaultPassengerInformationRequestDynamicParams(): PassengerInformationRequestDynamicParams {
  return {
    getCartReply: undefined,
    getMemberInformationReply: undefined,
    getMemberInformationReplyMediValdYmd: undefined,
  };
}
