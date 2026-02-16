import { AbstractControl, ValidatorFn } from '@angular/forms';
import { ValidateLengthOptions, ValidationErrorInfo } from '../../../interfaces';

/**
 *  桁数チェックValidator
 *
 * @param {ValidateLengthOptions} option
 * @returns {ValidatorFn}
 */
export function lengthValidator(option: ValidateLengthOptions): ValidatorFn {
  // チェックエラー時の戻り値定義
  const validationError = (defMsgId: string) => {
    return {
      'validate-length': {
        errorMsgId: option.errorMsgId || defMsgId,
        params: option.params,
      },
    };
  };

  return (control: AbstractControl): { [key: string]: ValidationErrorInfo } | null => {
    if (!control.value) {
      return null;
    }
    const dataLength = control.value.length;
    // 指定桁数チェック
    // valueとfixedの値が存在し、かつvalueの桁数とfixedの値が一致していない場合、チェックNGとする
    if (option.fixed && option.fixed !== dataLength) {
      return validationError('E0009');
      // 最小桁数チェック
      // valueとminの値が存在し、かつvalueの桁数はminの値より小さい場合、チェックNGとする
    } else if (option.min && dataLength < option.min) {
      return validationError('E0008');
    }
    return null;
  };
}
