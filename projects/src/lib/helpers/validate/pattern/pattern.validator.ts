import { AbstractControl, ValidatorFn } from '@angular/forms';
import { ValidatePatternOptions, ValidationErrorInfo } from '../../../interfaces';

/**
 * 正規表現チェック
 *
 * @param {string} data チェック対象
 * @param {string} regex チェック用の正規表現
 * @returns {boolean}
 */
export function matchedRegexPattern(data: string, regex: string): boolean {
  return new RegExp(regex).test(data);
}

/**
 * 正規表現チェックValidator
 *
 * @param {ValidatePatternOptions} option
 * @returns {ValidatorFn}
 */
export function patternValidator(option: ValidatePatternOptions): ValidatorFn {
  return (control: AbstractControl): { [key: string]: ValidationErrorInfo } | null => {
    // valueの値が存在し、かつpatternとマッチしない場合エラー情報を返却
    if (control.value && !matchedRegexPattern(control.value, option.pattern)) {
      return {
        'validate-pattern': {
          errorMsgId: option.errorMsgId || 'E0015',
          params: option.params,
        },
      };
    }
    return null;
  };
}
