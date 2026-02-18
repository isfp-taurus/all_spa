import { ValidationErrors } from '@angular/forms';
import { CountryCodeNameType, MCountry, MListData } from '@common/interfaces';
import { ReplaceParam } from '@lib/interfaces';

//代表者連絡先情報ブロック 埋め込み情報
export const PassengerInformationRequestRepresentativeInformationEmailParams: ReplaceParam = {
  key: 0,
  value: 'label.eMailAddress.passengerInput',
};
export const PassengerInformationRequestRepresentativeInformationConfirmEmailParams: ReplaceParam = {
  key: 0,
  value: 'label.confirmMailAddress',
};
export const PassengerInformationRequestRepresentativeInformationCountryCodeParams: ReplaceParam = {
  key: 0,
  value: 'label.countryCode',
};
export const PassengerInformationRequestRepresentativeInformationNumberParams: ReplaceParam = {
  key: 0,
  value: 'label.telephoneNumber.passengerInput',
};

export const PassengerInformationRequestRepresentativeInformationConfirmEmailError: ValidationErrors = {
  'validate-email': {
    errorMsgId: 'E0461',
    params: {
      key: 0,
      value: 'label.confirmMailAddress',
    },
  },
};

/**
 * 代表者連絡先情報ブロックデータ
 * @param email Eメールアドレス
 * @param emailConfirm Eメールアドレス2（確認用）
 * @param tellType 電話番号種別
 * @param phoneCountry 電話番号国jaなど
 * @param phoneCountryNumber 国別電話番号+81など
 * @param phoneNumber 電話番号
 */
export interface PassengerInformationRequestRepresentativeInformationData {
  email: string;
  emailConfirm: string;
  tellType: string;
  phoneCountry: string;
  phoneCountryNumber: string;
  phoneNumber: string;
  isError: boolean;
}
export function initialPassengerInformationRequestRepresentativeInformationData(): PassengerInformationRequestRepresentativeInformationData {
  const ret: PassengerInformationRequestRepresentativeInformationData = {
    email: '',
    emailConfirm: '',
    tellType: '',
    phoneCountry: '',
    phoneCountryNumber: '',
    phoneNumber: '',
    isError: false,
  };
  return ret;
}
/**
 * 代表者連絡先情報ブロックパーツ
 * @param nextAction 次のアクションに表示するラベル
 * @param registrarionLabel 登録状況ラベル
 * @param isEditPosCanada カナダフラグ
 * @param isEnableComplete 入力完了操作エリア表示フラグ
 * @param phoneCountry 国リスト
 * @param pd010 電話番号種別リスト
 * @param isCloseEnable 閉じるボタン有効フラグ
 */
export interface PassengerInformationRequestRepresentativeInformationParts {
  nextAction: string;
  registrarionLabel: string;
  isEditPosCanada: boolean;
  isEnableComplete: boolean;
  country: Array<MCountry>;
  pd010: Array<MListData>;
  phoneCountry: Array<CountryCodeNameType>;
  isCloseEnable: boolean;
}
export function initialPassengerInformationRequestRepresentativeInformationParts(): PassengerInformationRequestRepresentativeInformationParts {
  const ret: PassengerInformationRequestRepresentativeInformationParts = {
    nextAction: '',
    registrarionLabel: '',
    isEditPosCanada: false,
    isEnableComplete: false,
    country: [],
    pd010: [],
    phoneCountry: [],
    isCloseEnable: true,
  };
  return ret;
}
