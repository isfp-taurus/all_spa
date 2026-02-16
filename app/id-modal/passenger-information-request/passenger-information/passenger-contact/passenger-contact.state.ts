import { ValidationErrors } from '@angular/forms';
import { CountryCodeNameType, MCountry } from '@common/interfaces';
import { ReplaceParam, ValidateLengthOptions } from '@lib/interfaces';

/**
 * 搭乗者連絡先情報データ
 * @param passengerMailDestination 搭乗者メール送付先
 * @param passengerMailAddress 搭乗者メールアドレス
 * @param passengerMailAddressConfirm 搭乗者メールアドレス(確認用)
 * @param passengerSMSDestination 搭乗者SMS送信先
 * @param passengerSMSCountry 搭乗者SMS番号国
 * @param passengerSMSCountryNumber 搭乗者SMS番号の国番号
 * @param passengerSMSNumber 搭乗者SMS番号
 * @param passengerSecondContactDestination 2件目緊急連絡先選択
 * @param passengerSecondContactCountry 2件目緊急連絡先電話番号国
 * @param passengerSecondContactCountryNumber 2件目緊急連絡先電話番号の国番号
 * @param passengerSecondContactNumber 2件目緊急連絡先電話番号
 * @param passengerSecondContactOwnerOfPhone 2件目緊急連絡先電話番号の持ち主
 */
export interface PassengerInformationRequestPassengerContactData {
  passengerMailDestination: string;
  passengerMailAddress: string;
  passengerMailAddressConfirm: string;
  passengerSMSDestination: string;
  passengerSMSCountry: string;
  passengerSMSCountryNumber: string;
  passengerSMSNumber: string;
  passengerSecondContactDestination: string;
  passengerSecondContactCountry: string;
  passengerSecondContactCountryNumber: string;
  passengerSecondContactNumber: string;
  passengerSecondContactOwnerOfPhone: string;
  isError: boolean;
}
export function initialPassengerInformationRequestPassengerContactData(): PassengerInformationRequestPassengerContactData {
  const ret: PassengerInformationRequestPassengerContactData = {
    passengerMailDestination: '',
    passengerMailAddress: '',
    passengerMailAddressConfirm: '',
    passengerSMSDestination: '',
    passengerSMSCountry: '',
    passengerSMSCountryNumber: '',
    passengerSMSNumber: '',
    isError: false,
    passengerSecondContactDestination: '',
    passengerSecondContactCountry: '',
    passengerSecondContactCountryNumber: '',
    passengerSecondContactNumber: '',
    passengerSecondContactOwnerOfPhone: '',
  };
  return ret;
}
/**
 * 搭乗者連絡先情報 設定値作成
 * @param isMailDestinationSpecial 個別に送るフラグ
 * @param isEnableRrepresentative SMS代表者と同じを選択可にするか
 * @param isEnableRepresentativeMail Mail代表者と同じを選択可にするか
 * @param isDisplayPassengerSMSDestination SMS表示フラグ
 * @param isNhAndArriveUsa 旅程にNHグループ運航を含む、かつ到着国がアメリカの便が存在する場合
 * @param isFirst 最初の搭乗者かどうか
 * @param country 国リスト
 * @param phoneCountry 国コード名称マップ
 * @param phoneCountrySecondContact 国コード名称マップ　第2連絡先用
 */
export interface PassengerInformationRequestPassengerContactParts {
  isMailDestinationSpecial: boolean;
  isEnableRrepresentative: boolean;
  isEnableRepresentativeMail: boolean;
  isDisplayPassengerSMSDestination: boolean;
  isNhAndArriveUsa: boolean;
  isFirst: boolean;
  country: Array<MCountry>;
  phoneCountry: Array<CountryCodeNameType>;
  phoneCountrySecondContact: Array<CountryCodeNameType>;
}
export function initialPassengerInformationRequestPassengerContactParts(): PassengerInformationRequestPassengerContactParts {
  const ret: PassengerInformationRequestPassengerContactParts = {
    isMailDestinationSpecial: true,
    isEnableRrepresentative: false,
    isEnableRepresentativeMail: false,
    isDisplayPassengerSMSDestination: false,
    isNhAndArriveUsa: false,
    isFirst: false,
    country: [],
    phoneCountry: [],
    phoneCountrySecondContact: [],
  };
  return ret;
}

export const PassengerInformationRequestPassengerContactParams = {
  emailDestination: {
    key: 0,
    value: 'label.passengerContactInformation',
  } as ReplaceParam,
  email: {
    key: 0,
    value: 'label.eMailAddress.passengerInput',
  } as ReplaceParam,
  confirmEmail: {
    key: 0,
    value: 'label.confirmMailAddress',
  } as ReplaceParam,
  phoneDestination: {
    key: 0,
    value: 'label.passengerContactInformation',
  } as ReplaceParam,
  countryCode: {
    key: 0,
    value: 'label.countryCode',
  } as ReplaceParam,
  number: {
    key: 0,
    value: 'label.telephoneNumber.passengerInput',
  } as ReplaceParam,
  ownerOfPhone: {
    key: 0,
    value: 'label.phoneNumberOwner',
  } as ReplaceParam,
  ownerOfPhoneMinCheckParams: {
    min: 2,
    errorMsgId: 'E0008',
    params: [
      {
        key: 0,
        value: 'label.phoneNumberOwner',
      },
      {
        key: 1,
        value: 2,
        dontTranslate: true,
      },
    ],
  } as ValidateLengthOptions,
};

export const PassengerInformationRequestPassengerContactConfirmEmailError: ValidationErrors = {
  'validate-email': {
    errorMsgId: 'E0461',
    params: {
      key: 0,
      value: 'label.confirmMailAddress',
    },
  },
};
