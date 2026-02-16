import { AbstractControl, ValidatorFn } from '@angular/forms';
import { ValidateEmailOptions, ValidationErrorInfo } from '../../../interfaces';
import { matchedRegexPattern } from '../pattern/pattern.validator';

/**
 * メールアドレスチェック（形式チェック）
 *
 * @param {string} data チェック対象
 * @returns {boolean}
 */
export function isEmail(data: string): boolean {
  const EMAIL_PATTERN =
    '^[_A-Za-z0-9-]+(\\.[_A-Za-z0-9-]+)*@[A-Za-z0-9]+([-]*[A-Za-z0-9]+)*(\\.[A-Za-z0-9]+([-]*[A-Za-z0-9])*)*(\\.[A-Za-z]{2,})$';
  return matchedRegexPattern(data, EMAIL_PATTERN);
}

/**
 * メールアドレスチェックValidator
 *
 * @param {?ValidateEmailOptions} [option]
 * @returns {ValidatorFn}
 */
export function emailValidator(option?: ValidateEmailOptions): ValidatorFn {
  return (control: AbstractControl): { [key: string]: ValidationErrorInfo } | null => {
    if (!control.value) {
      return null;
    }
    let validationError: ValidationErrorInfo;
    // 最大桁数チェック
    if (control.value.length > 50) {
      validationError = {
        errorMsgId: option?.lengthMsgId || 'E0016',
        params: option?.lengthParams || option?.params,
      };
      // メールアドレス正規表現チェック
    } else if (!isEmail(control.value)) {
      validationError = {
        errorMsgId: option?.patternMsgId || 'E0017',
        params: option?.patternParams || option?.params,
      };
    } else {
      return null;
    }
    return { 'validate-email': validationError };
  };
}
