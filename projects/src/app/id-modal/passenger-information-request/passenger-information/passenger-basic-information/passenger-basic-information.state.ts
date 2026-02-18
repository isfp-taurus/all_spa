/**
 * 搭乗者基本情報データ
 *
 */

import { FormControl, ValidationErrors } from '@angular/forms';
import { ReplaceParam, ValidateLengthOptions, ValidationErrorInfo } from '@lib/interfaces';

/**
 * 搭乗者基本情報 データ
 * @param title 敬称
 * @param firstName 名
 * @param middleName ミドルネーム
 * @param lastName 姓
 * @param selectYmd　生年月日
 * @param gender 性別
 */
export interface PassengerInformationRequestPassengerBasicInformationData {
  title: string;
  firstName: string;
  middleName: string;
  lastName: string;
  selectYmd: Date | null;
  gender: string;
  isError: boolean;
}
export function initialPassengerInformationRequestPassengerBasicInformationData(): PassengerInformationRequestPassengerBasicInformationData {
  return {
    title: '',
    firstName: '',
    middleName: '',
    lastName: '',
    selectYmd: new Date(),
    gender: '',
    isError: false,
  };
}
/**
 * 搭乗者基本情報 設定値
 * @param titleList 敬称リスト
 * @param genderList 性別リスト
 * @param order 姓名表示順 0 or 1 or 2
 * @param passengerTypeCode 搭乗者種別　敬称未設定時に自動設定するため必要
 * @param selectDate 生年月日設定値
 * @param selectDate.order 表示順　例：YMD
 * @param selectDate.dateFrom 選択可能年月日FROM
 * @param selectDate.dateTo 選択可能年月日TO
 * @param selectDate.initialDate 初期設定値
 * @param selectDate.initialDate.year 初期設定値 年
 * @param selectDate.initialDate.month 初期設定値　月
 * @param selectDate.initialDate.day 初期設定値　日
 * @param selectDate.errorMsg エラーメッセージ
 */
export interface PassengerInformationRequestPassengerBasicInformationParts {
  titleList: Array<{ value: string; disp: string }>;
  genderList: Array<{ value: string; disp: string }>;
  order: string;
  passengerTypeCode: string;
  selectDate: {
    order: string;
    dateFrom: Date;
    dateTo: Date;
    initialDate: {
      year?: number;
      month?: number;
      day?: number;
    };
    errorMsg: string | ValidationErrorInfo;
  };
}

export function initialPassengerInformationRequestPassengerBasicInformationParts(): PassengerInformationRequestPassengerBasicInformationParts {
  const ret: PassengerInformationRequestPassengerBasicInformationParts = {
    titleList: [],
    genderList: [],
    order: '',
    passengerTypeCode: '',
    selectDate: {
      order: '',
      dateFrom: new Date(),
      dateTo: new Date(),
      initialDate: {
        year: undefined,
        month: undefined,
        day: undefined,
      },
      errorMsg: '',
    },
  };
  return ret;
}

/**
 * 姓名表示用のインターフェイス
 * @param name  nameタグに指定する文字
 * @param reader リーダーに表示するラベル
 * @param label 表示ラベル
 * @param placeholder Placeholderラベル
 * @param formControl フォームコントロール
 * @param required 必須フラグ
 * @param maxlength 入力最大文字数
 */
export interface PassengerInformationRequestPassengerBasicInformationNameDisp {
  name: string;
  reader: string;
  label: string;
  placeholder: string;
  formControl?: FormControl;
  required: boolean;
  maxlength: string;
}

//Placeholder用変換
export const PassengerInformationReplaceParamMap = {
  firstNameParams: {
    key: 0,
    value: 'label.firstName',
  } as ReplaceParam,
  middleNameParams: {
    key: 0,
    value: 'label.middleName',
  } as ReplaceParam,

  lastNameNameParams: {
    key: 0,
    value: 'label.lastName',
  } as ReplaceParam,
  lastNameMinCheckParams: {
    min: 2,
    errorMsgId: 'E0458',
  } as ValidateLengthOptions,
  genderParams: {
    key: 0,
    value: 'label.gender',
  } as ReplaceParam,
};

//名 項目に表示するエラー情報
export const PassengerInformationRequestPassengerBasicInfoFirstNameErrorInfo: ValidationErrors = {
  'validate-name': {
    errorMsgId: 'E0459',
    params: [
      {
        key: 0,
        value: 'label.firstName',
      },
      {
        key: 1,
        value: 'label.middleName',
      },
    ],
  },
};
//姓 項目に表示するエラー情報
export const PassengerInformationRequestPassengerBasicInfoLastNameErrorInfo: ValidationErrors = {
  'validate-name': {
    errorMsgId: 'E0460',
    params: [
      {
        key: 0,
        value: 'label.lastName',
      },
      {
        key: 1,
        value: 'label.middleName',
      },
      {
        key: 2,
        value: 'label.firstName',
      },
    ],
  },
};
//枠のみ赤くしたい場合のエラー情報
export const PassengerInformationRequestPassengerBasicInfoErrorInfo: ValidationErrors = {
  'validate-name': {
    errorMsgId: '',
  },
};
