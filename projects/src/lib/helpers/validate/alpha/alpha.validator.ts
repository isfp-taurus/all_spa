import { AbstractControl, ValidatorFn } from '@angular/forms';
import { ValidateOptions, ValidationErrorInfo } from '../../../interfaces';
import { matchedRegexPattern } from '../pattern/pattern.validator';

/**
 * 英字チェック
 *
 * @param {string} data チェック対象
 * @returns {boolean}
 */
export function isAlphabet(data: string): boolean {
  return matchedRegexPattern(data, '^[a-zA-Z]*$');
}

/**
 * 英字チェックValidator
 *
 * @param {?ValidateOptions} [option]
 * @returns {ValidatorFn}
 */
export function alphaValidator(option?: ValidateOptions): ValidatorFn {
  return (control: AbstractControl): { [key: string]: ValidationErrorInfo } | null => {
    // valueの値が存在し、かつ英字の正規表現とマッチしない場合エラー情報を返却
    if (control.value && !isAlphabet(control.value)) {
      return {
        'validate-alpha': {
          errorMsgId: option?.errorMsgId || 'E0004',
          params: option?.params,
        },
      };
    }
    return null;
  };
}
