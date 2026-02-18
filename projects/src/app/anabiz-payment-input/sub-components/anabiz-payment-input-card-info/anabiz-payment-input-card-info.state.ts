import { AbstractControl, ValidatorFn } from '@angular/forms';
import { ValidateOptions, ValidateRequiredOptions, ValidationErrorInfo } from '@lib/interfaces';

/**
 * 年月必須チェックValidator
 *
 * @param {?ValidateRequiredOptions} [option]
 * @returns {ValidatorFn}
 */
export function requiredYmValidator(option: ValidateYmRequiredOptions): ValidatorFn {
  // チェックエラー時の戻り値定義
  const validationError = {
    'validate-required': {
      errorMsgId: option?.errorMsgId || 'E0700',
      params: option?.params,
    },
  };

  return (control: AbstractControl): { [key: string]: ValidationErrorInfo } | null => {
    if (control.value.length !== 6) {
      return validationError;
    }
    return null;
  };
}

export interface ValidateYmRequiredOptions extends ValidateOptions {}
