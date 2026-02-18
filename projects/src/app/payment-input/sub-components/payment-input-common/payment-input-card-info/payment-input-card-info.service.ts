import { Injectable } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidatorFn } from '@angular/forms';
import { LocalDateService } from '@common/services';
import { SupportClass } from '@lib/components/support-class';
import { AswValidators } from '@lib/helpers';
import { ValidateOptions, ValidationErrorInfo } from '@lib/interfaces';

@Injectable()
export class PaymentInputCardInfoService extends SupportClass {
  constructor(private _localDateService: LocalDateService) {
    super();
  }

  destroy(): void {}

  /**
   * クレジットカード情報のフォームコントロール作成
   * @param isSelectedSkyCoin ANAスカイコイン支払か
   * @returns クレジットカード情報のフォームコントロール
   */
  initCardInfoFormGroup(isSelectedSkyCoin: boolean) {
    // クレジットカード番号のバリデータ
    const cardNumberValidator = [];
    // 有効期限のバリデータ
    const cardExpiryDateValidator = [];
    cardExpiryDateValidator.push(
      this._validateSelectYm(isSelectedSkyCoin, { params: { key: 0, value: 'label.expirationDate' } })
    );
    // CVVのバリデータ
    const securityCodeValidator = [];
    // カード名義のバリデータ
    const ownerNameValidator = [];
    if (!isSelectedSkyCoin) {
      //スカイコイン選択時以外（クレジットカード選択時）
      cardNumberValidator.push(AswValidators.required({ params: { key: 0, value: 'label.creditCardNumber' } }));
      securityCodeValidator.push(AswValidators.required({ params: { key: 0, value: 'label.securityCode' } }));
      ownerNameValidator.push(AswValidators.required({ params: { key: 0, value: 'label.cardholderName' } }));
    }
    //共通的にセットするバリデーター
    cardNumberValidator.push(
      AswValidators.numeric({ params: { key: 0, value: 'label.creditCardNumber' } }),
      AswValidators.lengths({
        min: 11,
        errorMsgId: 'E0544',
        params: [
          { key: 0, value: 11, dontTranslate: true },
          { key: 1, value: 16, dontTranslate: true },
        ],
      })
    );
    securityCodeValidator.push(
      AswValidators.numeric({ params: { key: 0, value: 'label.securityCode' } }),
      AswValidators.lengths({
        min: 3,
        errorMsgId: 'E0544',
        params: [
          { key: 0, value: 3, dontTranslate: true },
          { key: 1, value: 4, dontTranslate: true },
        ],
      })
    );
    ownerNameValidator.push(AswValidators.alphaSpace({ params: { key: 0, value: 'label.cardholderName' } }));

    return new FormGroup({
      // UATP
      uatpCard: new FormControl(false, []),
      // クレジットカード番号
      cardNumber: new FormControl('', cardNumberValidator),
      // 有効期限
      cardExpiryDate: new FormControl('', cardExpiryDateValidator),
      // CVV
      securityCode: new FormControl('', securityCodeValidator),
      // CVV
      securityCodeDisabled: new FormControl('_ _ _'),
      // カード名義
      ownerName: new FormControl('', ownerNameValidator),
      // いつものカード
      reservation: new FormControl(),
    });
  }

  /**
   * フォーム用データ変換用関数
   * @param date mmyy形式の日付文字列
   * @return yyyymm形式の日付文字列
   */
  convertToDateYmFormData(date: string): string {
    if (date.length === 4) {
      return date ? '20' + date.substring(2) + date.substring(0, 2) : '';
    } else {
      return date;
    }
  }

  /**
   * 有効期限が過ぎているかどうかを判定する関数
   * @param date mmyy形式の文字列
   * @returns 有効期限が過ぎているかどうか
   */
  public isExpired(date: string | Date, currentDate: Date): boolean {
    if (typeof date === 'string') {
      const ymDate = this.convertToDateYmFormData(date);
      return currentDate > new Date(Number(ymDate.substring(0, 4)), Number(ymDate.substring(4)));
    } else {
      return currentDate > date;
    }
  }

  /**
   * 年月プルダウンバリデータ作成
   *
   * @param isSelectedSkyCoin ANAスカイコイン支払か
   * @param option　バリデータオプション
   * @returns バリデータ
   */
  private _validateSelectYm(isSelectedSkyCoin: boolean, option?: ValidateOptions): ValidatorFn {
    const validKey = isSelectedSkyCoin ? 'validate-required-selectYmSkyCoin' : 'validate-required-selectYm';
    return (control: AbstractControl): { [key: string]: ValidationErrorInfo } | null => {
      if (isSelectedSkyCoin && (!control.value || control.value.length === 6)) {
        return this.checkValidDate(control.value, validKey, option);
      } else if (!isSelectedSkyCoin && control.value && control.value.length === 6) {
        return this.checkValidDate(control.value, validKey, option);
      } else {
        return {
          [validKey]: {
            errorMsgId: option?.errorMsgId || 'E0700',
            params: option?.params,
          },
        };
      }
    };
  }

  /**
   *  有効期限日が過去日であるか判断
   *
   *  @param validDate 有効的な日付
   *  @param validKey バリデータキー
   *  @param option　バリデータオプション
   *　@returns バリデータ
   */
  private checkValidDate(validate: string, validKey: string, option?: ValidateOptions) {
    if (validate.length === 6) {
      const nowDate = this._localDateService.getCurrentDateStr('YYYYMM');
      if (Number(validate) < Number(nowDate)) {
        return {
          [validKey]: {
            errorMsgId: option?.errorMsgId || 'E1767',
            params: option?.params,
          },
        };
      } else {
        return null;
      }
    } else {
      return null;
    }
  }
}
