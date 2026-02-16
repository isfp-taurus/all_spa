import { AbstractControl, ValidatorFn } from '@angular/forms';
import { ValidateOptions, ValidationErrorInfo } from '../../../interfaces';
import { matchedRegexPattern } from '../pattern/pattern.validator';

/**
 * 英数字空白チェック
 *
 * @param {string} data チェック対象
 * @returns {boolean}
 */
export function isAlphaNumericSpace(data: string): boolean {
  return matchedRegexPattern(data, '^[a-zA-Z0-9 ]*$');
}

/**
 * 英数字空白チェックValidator
 *
 * @param {?ValidateOptions} [option]
 * @returns {ValidatorFn}
 */
export function alphaNumericSpaceValidator(option?: ValidateOptions): ValidatorFn {
  return (control: AbstractControl): { [key: string]: ValidationErrorInfo } | null => {
    // valueの値が存在し、かつ英数字空白の正規表現とマッチしない場合エラー情報を返却
    if (control.value && !isAlphaNumericSpace(control.value)) {
      return {
        'validate-alpha-numeric-space': {
          errorMsgId: option?.errorMsgId || 'E0006',
          params: option?.params,
        },
      };
    }
    return null;
  };
}
