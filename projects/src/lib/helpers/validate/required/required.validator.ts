import { AbstractControl, ValidatorFn } from '@angular/forms';
import { ValidateRequiredOptions, ValidationErrorInfo } from '../../../interfaces';

/**
 * 必須チェックValidator
 *
 * @param {?ValidateRequiredOptions} [option]
 * @returns {ValidatorFn}
 */
export function requiredValidator(option?: ValidateRequiredOptions): ValidatorFn {
  // チェックエラー時の戻り値定義
  const validationError = {
    'validate-required': {
      // メッセージIDの指定がない場合、デフォルトのエラーメッセージIDを設定する
      // （デフォルトのエラーメッセージIDはテキスト入力要素か否かでIDを決める）
      errorMsgId: option?.errorMsgId || (option?.isNotInput ? 'E0002' : 'E0001'),
      params: option?.params,
    },
  };

  return (control: AbstractControl): { [key: string]: ValidationErrorInfo } | null => {
    // valueが存在しない場合エラー情報を返却
    if (!control.value) {
      return validationError;
      // Arrayタイプの場合の考慮（checkboxの場合、例: [true, false, false]）
    } else if (Array.isArray(control.value)) {
      const isChecked = control.value.some((checked: boolean) => checked);
      return !isChecked ? validationError : null;
    }
    return null;
  };
}
