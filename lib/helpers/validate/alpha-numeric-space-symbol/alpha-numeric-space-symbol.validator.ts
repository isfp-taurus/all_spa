import { AbstractControl, ValidatorFn } from '@angular/forms';
import { ValidateOptions, ValidationErrorInfo } from '../../../interfaces';
import { matchedRegexPattern } from '../pattern/pattern.validator';

/**
 * 英数字空白記号チェック
 * - ※記号は、半角スラッシュ『/』 、半角ドット『.』、半角カンマ『,』、半角ハイフン『-』を許容する
 *
 * @param {string} data チェック対象
 * @returns {boolean}
 */
export function isAlphaNumericSpaceSymbol(data: string): boolean {
  return matchedRegexPattern(data, '^[a-zA-Z0-9 /.,-]*$');
}

/**
 * 英数字空白記号チェックValidator
 *
 * @param {?ValidateOptions} [option]
 * @returns {ValidatorFn}
 */
export function alphaNumericSpaceSymbolValidator(option?: ValidateOptions): ValidatorFn {
  return (control: AbstractControl): { [key: string]: ValidationErrorInfo } | null => {
    // valueの値が存在し、かつ英数字空白記号の正規表現とマッチしない場合エラー情報を返却
    if (control.value && !isAlphaNumericSpaceSymbol(control.value)) {
      return {
        'validate-alpha-numeric-space-symbol': {
          errorMsgId: option?.errorMsgId || 'E0007',
          params: option?.params,
        },
      };
    }
    return null;
  };
}
