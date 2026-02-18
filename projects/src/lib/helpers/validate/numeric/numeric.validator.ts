import { AbstractControl, ValidatorFn } from '@angular/forms';
import { ValidateOptions, ValidationErrorInfo } from '../../../interfaces';
import { matchedRegexPattern } from '../pattern/pattern.validator';

/**
 * 数字チェック
 *
 * @param {string} data チェック対象
 * @returns {boolean}
 */
export function isNumeric(data: string): boolean {
  return matchedRegexPattern(data, '^[0-9]*$');
}

/**
 * 数字チェックValidator
 *
 * @param {?ValidateOptions} [option]
 * @returns {ValidatorFn}
 */
export function numericValidator(option?: ValidateOptions): ValidatorFn {
  return (control: AbstractControl): { [key: string]: ValidationErrorInfo } | null => {
    // valueの値が存在し、かつ数字の正規表現とマッチしない場合エラー情報を返却
    if (control.value && !isNumeric(control.value)) {
      return {
        'validate-numeric': {
          errorMsgId: option?.errorMsgId || 'E0003',
          params: option?.params,
        },
      };
    }
    return null;
  };
}
