import { ValidatorFn } from '@angular/forms';
import {
  ValidateRequiredOptions,
  ValidateOptions,
  ValidateEmailOptions,
  ValidateLengthOptions,
  ValidateNumericRangeOptions,
  ValidatePatternOptions,
  ValidatePhoneNumberOptions,
} from '../../interfaces';
import { alphaValidator } from './alpha/alpha.validator';
import { alphaNumericValidator } from './alpha-numeric/alpha-numeric.validator';
import { alphaNumericSpaceValidator } from './alpha-numeric-space/alpha-numeric-space.validator';
import { alphaNumericSpaceSymbolValidator } from './alpha-numeric-space-symbol/alpha-numeric-space-symbol.validator';
import { alphaSpaceValidator } from './alpha-space/alpha-space.validator';
import { emailValidator } from './email/email.validator';
import { lengthValidator } from './length/length.validator';
import { numericValidator } from './numeric/numeric.validator';
import { numericRangeValidator } from './numeric-range/numeric-range.validator';
import { patternValidator } from './pattern/pattern.validator';
import { phoneNumberValidator } from './phone-number/phone-number.validator';
import { requiredValidator } from './required/required.validator';
import { shiftJisValidator } from './shift-jis/shift-jis.validator';

/**
 * 入力チェック
 */
export class AswValidators {
  /**
   * 必須チェック
   *
   * @static
   * @param {?ValidateRequiredOptions} [option] （任意）{@link ValidateRequiredOptions}
   * @returns {ValidatorFn}
   */
  static required(option?: ValidateRequiredOptions): ValidatorFn {
    return requiredValidator(option);
  }

  /**
   * 正規表現チェック
   *
   * @static
   * @param {ValidatePatternOptions} option （必須）{@link ValidatePatternOptions}
   * @returns {ValidatorFn}
   */
  static pattern(option: ValidatePatternOptions): ValidatorFn {
    return patternValidator(option);
  }

  /**
   * 数字チェック
   *
   * @static
   * @param {?ValidateOptions} [option] （任意）{@link ValidateOptions}
   * @returns {ValidatorFn}
   */
  static numeric(option?: ValidateOptions): ValidatorFn {
    return numericValidator(option);
  }

  /**
   * 英字チェック
   *
   * @static
   * @param {?ValidateOptions} [option] （任意）{@link ValidateOptions}
   * @returns {ValidatorFn}
   */
  static alpha(option?: ValidateOptions): ValidatorFn {
    return alphaValidator(option);
  }

  /**
   * 英字空白チェック
   *
   * @static
   * @param {?ValidateOptions} [option] （任意）{@link ValidateOptions}
   * @returns {ValidatorFn}
   */
  static alphaSpace(option?: ValidateOptions): ValidatorFn {
    return alphaSpaceValidator(option);
  }

  /**
   * 英数字チェック
   *
   * @static
   * @param {?ValidateOptions} [option] （任意）{@link ValidateOptions}
   * @returns {ValidatorFn}
   */
  static alphaNumeric(option?: ValidateOptions): ValidatorFn {
    return alphaNumericValidator(option);
  }

  /**
   * 英数字空白チェック
   *
   * @static
   * @param {?ValidateOptions} [option] （任意）{@link ValidateOptions}
   * @returns {ValidatorFn}
   */
  static alphaNumericSpace(option?: ValidateOptions): ValidatorFn {
    return alphaNumericSpaceValidator(option);
  }

  /**
   * 英数字空白記号チェック
   * - ※記号は、半角スラッシュ『/』 、半角ドット『.』、半角カンマ『,』、半角ハイフン『-』を許容する
   *
   * @static
   * @param {?ValidateOptions} [option] （任意）{@link ValidateOptions}
   * @returns {ValidatorFn}
   */
  static alphaNumericSpaceSymbol(option?: ValidateOptions): ValidatorFn {
    return alphaNumericSpaceSymbolValidator(option);
  }

  /**
   * 桁数チェック
   *
   * @static
   * @param {ValidateLengthOptions} option （必須）{@link ValidateLengthOptions}
   * @returns {ValidatorFn}
   */
  static lengths(option: ValidateLengthOptions): ValidatorFn {
    return lengthValidator(option);
  }

  /**
   * 値範囲チェック
   *
   * @static
   * @param {ValidateNumericRangeOptions} option （必須）{@link ValidateNumericRangeOptions}
   * @returns {ValidatorFn}
   */
  static numericRange(option: ValidateNumericRangeOptions): ValidatorFn {
    return numericRangeValidator(option);
  }

  /**
   * メールアドレスチェック
   *
   * @static
   * @param {?ValidateEmailOptions} [option] （任意）{@link ValidateEmailOptions}
   * @returns {ValidatorFn}
   */
  static email(option?: ValidateEmailOptions): ValidatorFn {
    return emailValidator(option);
  }

  /**
   * 電話番号チェック
   *
   * @static
   * @param {ValidatePhoneNumberOptions} option （必須）{@link ValidatePhoneNumberOptions}
   * @returns {ValidatorFn}
   */
  static phoneNumber(option: ValidatePhoneNumberOptions): ValidatorFn {
    return phoneNumberValidator(option);
  }

  /**
   * Shift-JISチェック
   *
   * @static
   * @param {?ValidateOptions} [option] （任意）{@link ValidateOptions}
   * @returns {ValidatorFn}
   */
  static shiftJis(option?: ValidateOptions): ValidatorFn {
    return shiftJisValidator(option);
  }
}
