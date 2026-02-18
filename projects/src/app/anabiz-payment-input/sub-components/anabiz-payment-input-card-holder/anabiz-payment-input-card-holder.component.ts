import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import {
  AnabizCardHolderInfo,
  initAnabizCardHolderInfo,
} from '@app/anabiz-payment-input/container/anabiz-payment-input-cont.state';
import { matchValidator } from '@common/helper';
import { MCountry } from '@common/interfaces';
import { CountryCodeNameType } from '@common/interfaces';
import { SupportComponent } from '@lib/components/support-class';
import { AswValidators } from '@lib/helpers';
import { ValidatePhoneNumberOptions } from '@lib/interfaces';
import { CommonLibService } from '@lib/services';

@Component({
  selector: 'asw-anabiz-payment-input-card-holder',
  templateUrl: './anabiz-payment-input-card-holder.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnabizPaymentInputCardHolderComponent extends SupportComponent {
  @Input() countryAll: Array<MCountry> = [];
  @Input() phoneCountryInfoList: Array<CountryCodeNameType> = [];
  public holderInfoFormGroup: FormGroup;

  @Input() set cardHolderInfo(value: AnabizCardHolderInfo) {
    this._cardHolderInfo = value;
  }
  get cardHolderInfo(): AnabizCardHolderInfo {
    return this._cardHolderInfo;
  }
  private _cardHolderInfo: AnabizCardHolderInfo = initAnabizCardHolderInfo();
  @Output() cardHolderInfoChange = new EventEmitter<AnabizCardHolderInfo>();

  constructor(public common: CommonLibService, private _changeDetectorRef: ChangeDetectorRef) {
    super(common);
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
        this.cardHolderInfo.phone?.countryPhoneExtension,
        AswValidators.required({ isNotInput: true, params: { key: 0, value: 'label.countryCode' } })
      ),
      // 電話番号
      number: new FormControl('', [
        AswValidators.required({ params: { key: 0, value: 'label.telephoneNumber' } }),
        AswValidators.numeric({ params: { key: 0, value: 'label.telephoneNumber' } }),
        AswValidators.phoneNumber(this._phoneValidatorOption),
      ]),
    });
  }

  isValid() {
    const validity = this.holderInfoFormGroup.valid;
    this.holderInfoFormGroup.markAllAsTouched();
    this._changeDetectorRef.detectChanges();
    return validity;
  }

  //電話番号バリデータ
  private _phoneValidatorOption: ValidatePhoneNumberOptions = {
    telCountryCode: this.cardHolderInfo.phone?.countryPhoneExtension ?? '',
    params: { key: 0, value: 9, dontTranslate: true },
  };

  reload(): void {}
  init(): void {
    this.resetCreditCardHolderFormGroup();
  }
  destroy(): void {}

  refresh() {
    this.cardHolderInfoChange.emit(this.cardHolderInfo);
  }

  /**
   * 電話番号国の変更
   */
  countryChange() {
    this.cardHolderInfo.phone!.phoneCountry = this.holderInfoFormGroup.controls['countryCode'].value ?? '';
    // 活性/非活性
    this.cardHolderInfo.phone?.phoneCountry
      ? this.holderInfoFormGroup.controls['number']?.enable()
      : this.holderInfoFormGroup.controls['number']?.disable();

    //国が変わったのでバリデータに最新値をセットする
    this.cardHolderInfo.phone!.countryPhoneExtension =
      this.countryAll.find((country) => country.country_2letter_code === this.cardHolderInfo?.phone?.phoneCountry)
        ?.international_tel_country_code ?? '';

    this.phoneNumberValidatorRefresh();
    this.refresh();
  }

  /**
   * 電話番号部品のバリデータのリフレッシュ
   */
  phoneNumberValidatorRefresh() {
    this._phoneValidatorOption.telCountryCode = this.cardHolderInfo.phone?.countryPhoneExtension ?? '';
    this.holderInfoFormGroup.controls['number'].setValidators([
      AswValidators.required({ params: { key: 0, value: 'label.telephoneNumber' } }),
      AswValidators.numeric({ params: { key: 0, value: 'label.telephoneNumber' } }),
      AswValidators.phoneNumber(this._phoneValidatorOption),
    ]);
  }

  /**
   * 電話番号変更イベント
   */
  telephoneChange() {
    this.cardHolderInfo.phone!.number = this.holderInfoFormGroup.controls['number'].value;
    this.refresh();
  }

  /**
   * メールアドレス相関チェック
   */
  emailChange() {
    this.cardHolderInfo.email = this.holderInfoFormGroup.controls['email'].value;
    this.holderInfoFormGroup.controls['emailAgain'].updateValueAndValidity();
    this.refresh();
  }

  /**
   * 画面情報表示処理用
   */
  resetCreditCardHolderFormGroup(): void {
    const hasPhoneCountry = this.phoneCountryInfoList.find((phoneCountry) => {
      return (
        this.cardHolderInfo?.phone?.phoneCountry &&
        phoneCountry.countryCode === this.cardHolderInfo?.phone?.phoneCountry
      );
    });
    this.holderInfoFormGroup.setValue({
      email: this.cardHolderInfo?.email ?? '',
      emailAgain: this.cardHolderInfo?.email ?? '',
      countryCode: hasPhoneCountry ? this.cardHolderInfo?.phone?.phoneCountry : '',
      number: this.cardHolderInfo?.phone?.number ?? '',
    });
    this.cardHolderInfo?.phone?.phoneCountry
      ? this.holderInfoFormGroup.controls['number']?.enable()
      : this.holderInfoFormGroup.controls['number']?.disable();
  }
}
