import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { PaymentInputCardHolderInfo, initPhoneSelectData } from '@app/payment-input/container/payment-input-cont.state';
import { matchValidator } from '@common/helper';
import { CountryCodeNameType } from '@common/interfaces';
import { AswValidators } from '@lib/helpers';
import { CommonLibService } from '@lib/services';
import { SubComponentModelComponent } from '@common/components/feature-parts/sub-conponent-model/sub-component-model.component';
import {
  PaymentInputCardHolderInfoData,
  PaymentInputCardHolderInfoParts,
  initPaymentInputCardHolderInfoData,
  initPaymentInputCardHolderInfoParts,
  PaymentInputCardHolderInfoConfirmEmailError,
  PaymentInputCardHolderInfoConfirmEmailRequireError,
} from './payment-input-card-holder-info.state';
import { initHolderInfo } from '../../../container/payment-input-cont.state';
import { ValidatePhoneNumberOptions } from '@lib/interfaces';
/**
 * payment-input-card-holder-info
 * 支払方法：クレジットカード(名義人情報)
 */
@Component({
  selector: 'asw-payment-input-card-holder-info',
  styleUrls: ['./payment-input-card-holder-info.component.scss'],
  templateUrl: './payment-input-card-holder-info.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentInputCardHolderInfoComponent extends SubComponentModelComponent<
  PaymentInputCardHolderInfoData,
  PaymentInputCardHolderInfoParts
> {
  //SubComponentModelComponent用設定
  _data = initPaymentInputCardHolderInfoData();
  _parts = initPaymentInputCardHolderInfoParts();

  setDataEvent() {
    this.refresh();
  }

  setPartsEvent() {
    const hasPhoneCountry = this.phoneCountryInfoList.find((phoneCountry) => {
      return phoneCountry.countryCode === this.parts.countryCode;
    });
    this.holderInfoFormGroup.setValue({
      email: this.parts.email ?? '',
      emailAgain: this.parts.email ?? '',
      countryCode: hasPhoneCountry ? this.parts.countryCode : '',
      number: this.parts.phoneNumber ?? '',
    });
    this.parts.countryCode
      ? this.holderInfoFormGroup.controls['number']?.enable()
      : this.holderInfoFormGroup.controls['number']?.disable();
    this.refresh();
  }

  public holderInfoFormGroup: FormGroup;

  @Input() phoneCountryInfoList: Array<CountryCodeNameType> = [];
  @Input() cardHolderInfo: PaymentInputCardHolderInfo = initHolderInfo();

  //電話番号バリデータ
  public countryPhoneExtension = '';
  private _phoneValidatorOption: ValidatePhoneNumberOptions = {
    telCountryCode: this.countryPhoneExtension,
    params: { key: 0, value: 'label.telephoneNumber' },
  };

  constructor(private _common: CommonLibService, private _changeDetectorRef: ChangeDetectorRef) {
    super(_changeDetectorRef, _common);
    // 連絡先フォームグループ
    this.holderInfoFormGroup = new FormGroup({
      // メールアドレス
      email: new FormControl('', [
        AswValidators.required({ params: { key: 0, value: 'label.eMailAddress' } }),
        AswValidators.email({ params: { key: 0, value: 'label.eMailAddress' } }),
      ]),
      emailAgain: new FormControl('', [
        AswValidators.required({ params: { key: 0, value: 'label.confirmMailAddress' } }),
        AswValidators.email({ params: { key: 0, value: 'label.confirmMailAddress' } }),
        matchValidator('email'),
      ]),
      // 電話番号国選択
      countryCode: new FormControl(
        this.countryPhoneExtension,
        AswValidators.required({ isNotInput: true, params: { key: 0, value: 'label.countryCode' } })
      ),
      // 電話番号
      number: new FormControl('', [
        AswValidators.required({ params: { key: 0, value: 'label.telephoneNumber' } }),
        AswValidators.phoneNumber(this._phoneValidatorOption),
      ]),
    });
  }

  refresh() {
    // 電話番号（活性/非活性）状態更新
    if (!this.cardHolderInfo.phone) {
      this.cardHolderInfo.phone = initPhoneSelectData();
    }
    if (this.cardHolderInfo.phone.countryPhoneCode)
      this.cardHolderInfo.phone.countryPhoneCode = this.holderInfoFormGroup.controls['countryCode'].value ?? '';
    this.countryPhoneExtension =
      this.parts.countryAll.find((country) => country.country_2letter_code === this.parts.countryCode)
        ?.international_tel_country_code ?? '';
    this.phoneNumberValidatorRefresh();
    this._changeDetectorRef.markForCheck();
  }

  update() {
    this._data.email = this.holderInfoFormGroup.controls['email'].value ?? '';
    this._data.countryCode = this.holderInfoFormGroup.controls['countryCode'].value ?? '';
    this._data.countryNumber = this.countryPhoneExtension;
    this._data.phoneNumber = this.holderInfoFormGroup.controls['number'].value ?? '';
    this._data.validation = this.holderInfoFormGroup.valid;
    this.dataChange.emit(this._data);
  }

  invokeValidation() {
    this.holderInfoFormGroup.markAllAsTouched();
    this.update();
  }

  /**
   * 画面情報表示処理用
   */
  resetPartsEvent() {
    this.setPartsEvent();
  }

  reload(): void {}

  init(): void {}

  destroy(): void {}

  /**
   * 電話番号国の変更
   */
  countryChange() {
    if (this.cardHolderInfo.phone) {
      const countryCode = this.holderInfoFormGroup.controls['countryCode'].value ?? '';
      const countryNumber =
        this.parts.countryAll.find((country) => country.country_2letter_code === countryCode)
          ?.international_tel_country_code ?? '';
      this._phoneValidatorOption.telCountryCode = countryNumber;
      this.cardHolderInfo.phone.countryPhoneCode = countryCode;
      // 活性/非活性
      this.cardHolderInfo.phone.countryPhoneCode
        ? this.holderInfoFormGroup.controls['number']?.enable()
        : this.holderInfoFormGroup.controls['number']?.disable();
      //国が変わったのでバリデータに最新値をセットする
      this.countryPhoneExtension = countryNumber;
      this.cardHolderInfo.phone.countryPhoneExtension = this.countryPhoneExtension;
      this.phoneNumberValidatorRefresh();
      this.update();
    }
  }

  /**
   * 電話番号部品のバリデータのリフレッシュ
   */
  phoneNumberValidatorRefresh() {
    this._phoneValidatorOption.telCountryCode = this.countryPhoneExtension;
    this.holderInfoFormGroup.controls['number'].setValidators([
      AswValidators.required({ params: { key: 0, value: 'label.telephoneNumber' } }),
      AswValidators.phoneNumber(this._phoneValidatorOption),
    ]);
    this.holderInfoFormGroup.controls['number'].updateValueAndValidity({ onlySelf: false, emitEvent: false });
  }

  /**
   * 電話番号変更イベント
   */
  telephoneChange() {
    if (this.cardHolderInfo.phone) this.cardHolderInfo.phone.number = this.holderInfoFormGroup.controls['number'].value;
    this.update();
  }

  /**
   * メールアドレス相関チェック
   */
  emailChange() {
    this.update();
  }
}
