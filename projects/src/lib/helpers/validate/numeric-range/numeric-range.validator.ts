import { AbstractControl, ValidatorFn } from '@angular/forms';
import { ValidateNumericRangeOptions, ValidationErrorInfo } from '../../../interfaces';
import { isNumeric } from '../numeric/numeric.validator';

/**
 * 値範囲チェックValidator
 *
 * @param {ValidateNumericRangeOptions} option
 * @returns {ValidatorFn}
 */
export function numericRangeValidator(option: ValidateNumericRangeOptions): ValidatorFn {
  // チェックエラー時の戻り値定義
  const validationError = (defMsgId: string, defOnlyFlg?: boolean) => {
    const { errorMsgId = defMsgId, params } = option;
    return {
      'validate-numeric-range': {
        errorMsgId: defOnlyFlg ? defMsgId : errorMsgId,
        params: params,
      },
    };
  };

  return (control: AbstractControl): { [key: string]: ValidationErrorInfo } | null => {
    if (!control.value) {
      return null;
    }
    // 数字チェック
    if (!isNumeric(control.value)) {
      return validationError('E0011', true);
    }
    const checkedValue = Number(control.value);
    const { min, max } = option;
    // 値範囲（最小・最大）チェック
    // valueとminとmaxの値が存在し、valueはminの値より小さい、またはmaxの値より大きい場合、チェックNGとする
    if (min && max && (min > checkedValue || max < checkedValue)) {
      return validationError('E0014');
      // 値範囲（最小）チェック
      // valueとminの値が存在し、かつvalueはminの値より小さい場合、チェックNGとする
    } else if (min && !max && min > checkedValue) {
      return validationError('E0012');
      // 値範囲（最大）チェック
      // valueとmaxの値が存在し、かつvalueはmaxの値より大きい場合、チェックNGとする
    } else if (!min && max && max < checkedValue) {
      return validationError('E0013');
    }
    return null;
  };
}
