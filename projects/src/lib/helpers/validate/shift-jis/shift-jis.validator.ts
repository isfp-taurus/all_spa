import { AbstractControl, ValidatorFn } from '@angular/forms';
import { ValidateOptions, ValidationErrorInfo } from '../../../interfaces';
import * as Encoding from 'encoding-japanese';

/**
 * Shift-JISチェック
 *
 * @see {@link https://github.com/polygonplanet/encoding.js}
 * @param {string} data チェック対象
 * @returns {boolean}
 */
export function isShiftJis(data: string): boolean {
  if (!data) {
    return false;
  }
  const checkData = data.replace(/[?]/g, '');
  // 文字列をUnicodeの配列に変換
  const unicodeArray = Encoding.stringToCode(checkData);
  // Unicodeの配列をSJISの配列に変換
  const sjisArray = Encoding.convert(unicodeArray, {
    to: 'SJIS',
    from: 'UNICODE',
  });
  // SJISの配列をSJIS文字に変換
  const shiftJisData = Encoding.codeToString(sjisArray);
  // 変換した値に「?」が含まれている場合、チェックNGとする
  return !(shiftJisData.indexOf('?') >= 0);
}

/**
 * Shift-JISチェックValidator
 *
 * @param {?ValidateOptions} [option]
 * @returns {ValidatorFn}
 */
export function shiftJisValidator(option?: ValidateOptions): ValidatorFn {
  return (control: AbstractControl): { [key: string]: ValidationErrorInfo } | null => {
    // valueの値が存在し、かつShift-JISチェックNGの場合エラー情報を返却
    if (control.value && !isShiftJis(control.value)) {
      return {
        'validate-shift-jis': {
          errorMsgId: option?.errorMsgId || 'E0010',
          params: option?.params,
        },
      };
    }
    return null;
  };
}
