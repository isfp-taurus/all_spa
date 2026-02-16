import { AbstractControl, ValidatorFn } from '@angular/forms';
import { ValidateOptions, ValidationErrorInfo } from '../../../interfaces';
import { matchedRegexPattern } from '../pattern/pattern.validator';

/**
 * 英数字チェック
 *
 * @param {string} data チェック対象
 * @returns {boolean}
 */
export function isAlphaNumeric(data: string): boolean {
  return matchedRegexPattern(data, '^[a-zA-Z0-9]*$');
}

/**
 * 英数字チェックValidator
 *
 * @param {?ValidateOptions} [option]
 * @returns {ValidatorFn}
 */
export function alphaNumericValidator(option?: ValidateOptions): ValidatorFn {
  return (control: AbstractControl): { [key: string]: ValidationErrorInfo } | null => {
    // valueの値が存在し、かつ英数字の正規表現とマッチしない場合エラー情報を返却
    if (control.value && !isAlphaNumeric(control.value)) {
      return {
        'validate-alpha-numeric': {
          errorMsgId: option?.errorMsgId || 'E0005',
          params: option?.params,
        },
      };
    }
    return null;
  };
}
