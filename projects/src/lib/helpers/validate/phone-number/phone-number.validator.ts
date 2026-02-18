import { AbstractControl, ValidatorFn } from '@angular/forms';
import { ValidatePhoneNumberOptions, ValidationErrorInfo } from '../../../interfaces';
import { isNumeric } from '../numeric/numeric.validator';
import { matchedRegexPattern } from '../pattern/pattern.validator';

/** 日本国内電話番号の国番号 */
const COUNTRY_CODE_JP = '81';

/** 日本国内電話番号正規表現判定（9～11桁の半角数字） */
const isJpTelPattern = (tel: string): boolean => matchedRegexPattern(tel, '^[0-9]{9,11}$');

/** SMS送信対象の正規表現判定（先頭が070/080/090/70/80/90のいずれか）*/
const isSmsSendPattern = (tel: string): boolean => matchedRegexPattern(tel, '^0[789]0|^[789]0');

/** 国外電話番号正規表現判定（1~16桁の半角数字） */
const isForeignTelPattern = (tel: string): boolean => matchedRegexPattern(tel, '^[0-9]{1,16}$');

/**
 * 電話番号チェックValidator
 *
 * @param {ValidatePhoneNumberOptions} option
 * @returns {ValidatorFn}
 */
export function phoneNumberValidator(option: ValidatePhoneNumberOptions): ValidatorFn {
  // チェックエラー時の戻り値定義
  const validationError = (telType?: 'jp' | 'sms' | 'foreign') => {
    let { params, japanMsgId, japanParams, foreignMsgId, foreignParams } = option;
    let pErrorMsgId;
    let pParams = params;
    switch (telType) {
      case 'jp':
        pErrorMsgId = japanMsgId || 'E0018';
        pParams = japanParams || pParams;
        break;
      case 'sms':
        pErrorMsgId = japanMsgId || 'E0745';
        pParams = japanParams || pParams;
        break;
      case 'foreign':
        pErrorMsgId = foreignMsgId || 'E0019';
        pParams = foreignParams || pParams;
        break;
      default:
        pErrorMsgId = 'E0003';
        break;
    }
    return {
      'validate-phone-number': {
        errorMsgId: pErrorMsgId,
        params: pParams,
      },
    };
  };

  return (control: AbstractControl): { [key: string]: ValidationErrorInfo } | null => {
    if (!control.value) {
      return null;
    }
    // 数字チェック
    if (!isNumeric(control.value)) {
      return validationError();
    }
    const code = option.telCountryCode;
    // 日本国内電話番号チェック
    if (code === COUNTRY_CODE_JP) {
      if (!isJpTelPattern(control.value)) {
        return validationError('jp');
        // SMS電話番号チェック
      } else if (option.isSmsSend && !isSmsSendPattern(control.value)) {
        return validationError('sms');
      }
      // 国外電話番号チェック
    } else if (!isForeignTelPattern(control.value) || (code + control.value).length < 9) {
      return validationError('foreign');
    }
    return null;
  };
}
