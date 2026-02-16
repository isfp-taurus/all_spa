import { ValidationErrors } from '@angular/forms';
import { MListData } from '@common/interfaces';
import { ReplaceParam } from '@lib/interfaces';

/**
 * 発着通知連絡先情報データ
 * @param mailRecipientName 発着通知メール受信者
 * @param mailAddress 発着通知メールアドレス
 * @param confirmMailAddress 発着通知メールアドレス(確認用)
 * @param mailLang 発着通知メール送信言語
 * @param mailRecipientName2 発着通知メール受信者2
 * @param mailAddress2 発着通知メールアドレス2
 * @param confirmMailAddress2 発着通知メールアドレス(確認用)2
 * @param mailLang2 発着通知メール送信言語2
 * @param isError エラーフラグ
 */
export interface PassengerInformationRequestPassengerArrivalAndDepartureNoticeData {
  mailRecipientName: string;
  mailAddress: string;
  confirmMailAddress: string;
  mailLang: string;
  mailRecipientName2: string;
  mailAddress2: string;
  confirmMailAddress2: string;
  mailLang2: string;
  isError: boolean;
}
export function initialPassengerInformationRequestPassengerArrivalAndDepartureNoticeData(): PassengerInformationRequestPassengerArrivalAndDepartureNoticeData {
  return {
    mailRecipientName: '',
    mailAddress: '',
    confirmMailAddress: '',
    mailLang: '',
    mailRecipientName2: '',
    mailAddress2: '',
    confirmMailAddress2: '',
    mailLang2: '',
    isError: false,
  };
}
/**
 * 発着通知連絡先情報　設定値
 * @param isOpen 表示フラグ
 * @param isLang 言語表示フラグ
 * @param langList 言語リスト リストデータPD_065 言語名
 */
export interface PassengerInformationRequestPassengerArrivalAndDepartureNoticeParts {
  isOpen: boolean;
  isLang: boolean;
  langList: Array<MListData>;
}
export function initialPassengerInformationRequestPassengerArrivalAndDepartureNoticeParts(): PassengerInformationRequestPassengerArrivalAndDepartureNoticeParts {
  return {
    isOpen: false,
    isLang: false,
    langList: [],
  };
}
export const PassengerInformationRequestPassengerArrivalAndDepartureNoticeParams = {
  recipient: {
    key: 0,
    value: 'label.eMailRecipient',
  } as ReplaceParam,
  email: {
    key: 0,
    value: 'label.eMailAddress.passengerInput',
  } as ReplaceParam,
  confirmEmail: {
    key: 0,
    value: 'label.confirmMailAddress',
  } as ReplaceParam,
  lang: {
    key: 0,
    value: 'label.language',
  },
};

export const PassengerInformationRequestPassengerArrivalAndDepartureNoticeConfirmEmailError: ValidationErrors = {
  'validate-email': {
    errorMsgId: 'E0461',
    params: {
      key: 0,
      value: 'label.confirmMailAddress',
    },
  },
};
