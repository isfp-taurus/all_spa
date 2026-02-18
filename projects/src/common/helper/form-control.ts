import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { ValidateOptions, ValidationErrorInfo } from '@lib/interfaces';

/**
 * フォームグループのエラーチェック
 * @param group フォームグループ
 * @param names チェックコントロール名
 * @param isUpdate 更新フラグ
 * @returns エラーフラグ
 */
export function checkFormGroupValidate(group: FormGroup, names: Array<string>, isUpdate = false) {
  //FormGroupのバリデーションを強制起動
  if (isUpdate) {
    group.updateValueAndValidity();
    group.markAllAsTouched();
  }
  return names.some((name) => group.controls[name].errors);
}
/**
 * フォームコントロールのエラーチェック
 * @param kist フォームコントロールリスト
 * @param isUpdate 更新フラグ
 * @returns エラーフラグ
 */
export function checkFormListValidate(list: Array<FormControl>, isUpdate = false) {
  //FormGroupのバリデーションを強制起動
  if (isUpdate) {
    list.forEach((fc) => {
      fc.updateValueAndValidity();
      fc.markAllAsTouched();
    });
  }
  return list.some((fc) => fc.errors);
}

/**
 * フォームコントロールのエラーチェック(touchのみ)
 * @param kist フォームコントロールリスト
 * @param isUpdate 更新フラグ
 * @returns エラーフラグ
 */
export function checkFormListTouched(list: Array<FormControl>, isUpdate = false) {
  //FormGroupのバリデーションを強制起動
  if (isUpdate) {
    list.forEach((fc) => {
      fc.markAsTouched();
    });
  }
  return list.some((fc) => fc.errors);
}

/**
 * フォームコントロールがエラーかつtouchされたものがあるか
 * @param list ォームコントロールリスト
 * @returns 判定値
 */
export function checkFormErrorAndTouched(list: Array<FormControl>) {
  return list.some((form) => !!form.errors && (form.touched || form.value));
}

/**
 * 一致性バリデーション
 * @param targetFormControlName 一致性チェック対象FormControl名前
 * @param {?ValidateOptions} [option] （任意）{@link ValidateOptions}
 * @returns {ValidatorFn}
 */
export function matchValidator(targetFormControlName: string, option?: ValidateOptions): ValidatorFn {
  return (control: AbstractControl): { [key: string]: ValidationErrorInfo } | null => {
    const parent = control.parent;
    if (!parent) {
      return null;
    }

    const targetFormControl = parent.get(targetFormControlName);
    if (!targetFormControl) {
      return null;
    }

    const isValid = control.value === targetFormControl.value;
    return isValid
      ? null
      : {
          'validate-match': {
            errorMsgId: option?.errorMsgId || 'E0461',
            params: option?.params,
          },
        };
  };
}

/**
 * 一致エラーチェック
 * @param form1 フォームコントロール1
 * @param form2 フォームコントロール2　不一致の場合にエラーがセットされる
 * @param error セットするエラー内容
 * @return エラーか否か
 */
export function checkFormEqual(form1: FormControl, form2: FormControl, error: ValidationErrors) {
  if (form1.value !== form2.value) {
    form2.setErrors(error);
    form2.markAllAsTouched();
    return true;
  } else if (form2.errors) {
    form2.markAllAsTouched();
    form2.updateValueAndValidity();
  }
  return false;
}
