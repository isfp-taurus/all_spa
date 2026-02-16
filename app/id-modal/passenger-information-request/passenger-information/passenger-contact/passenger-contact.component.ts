import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { SubComponentModelComponent } from '@common/components/feature-parts/sub-conponent-model/sub-component-model.component';
import { checkFormEqual, checkFormListValidate, isStringEmpty } from '@common/helper';
import {
  PassengerMailDestinationType,
  PassengerPhoneDestinationType,
  PassengerSecondContactType,
} from '@common/interfaces';
import { SelectComponent } from '@lib/components';
import { AswValidators } from '@lib/helpers';
import { ValidatePhoneNumberOptions } from '@lib/interfaces';
import { CommonLibService } from '@lib/services';
import {
  PassengerInformationRequestPassengerContactData,
  PassengerInformationRequestPassengerContactParts,
  initialPassengerInformationRequestPassengerContactData,
  initialPassengerInformationRequestPassengerContactParts,
  PassengerInformationRequestPassengerContactConfirmEmailError,
  PassengerInformationRequestPassengerContactParams,
} from './passenger-contact.state';

/**
 * passenger-information-request
 * 搭乗者連絡先情報
 */

@Component({
  selector: 'asw-passenger-information-request-passenger-contact',
  templateUrl: './passenger-contact.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PassengerInformationRequestPassengerContactComponent extends SubComponentModelComponent<
  PassengerInformationRequestPassengerContactData,
  PassengerInformationRequestPassengerContactParts
> {
  constructor(public change: ChangeDetectorRef, protected _common: CommonLibService) {
    super(change, _common);
  }

  reload() {}
  init() {}
  destroy() {}
  public refresh() {
    this.passengerMailDestinationFc.setValue(
      this.parts.isEnableRepresentativeMail
        ? this.data.passengerMailDestination
        : PassengerMailDestinationType.INDIVIDUAL
    );
    this.passengerMailAddressFc.setValue(this.data.passengerMailAddress);
    this.passengerMailAddressConfirmFc.setValue(this.data.passengerMailAddressConfirm);
    this.passengerSMSDestinationFc.setValue(
      this.parts.isDisplayPassengerSMSDestination
        ? this.data.passengerSMSDestination
        : PassengerPhoneDestinationType.NOT_SEND
    );
    this.countryPhoneExtension =
      this.parts.country.find((country) => country.country_2letter_code === this.data.passengerSMSCountry)
        ?.international_tel_country_code ?? '';
    const hasPhoneCountry = this.parts.phoneCountry.find((phoneCountry) => {
      return phoneCountry.countryCode === this.data.passengerSMSCountry;
    });
    this.phoneCountryCodeFc.setValue(hasPhoneCountry ? this.data.passengerSMSCountry : '');
    this.phoneNumberFc.setValue(this.data.passengerSMSNumber);
    this.phoneNumberValidatorRefresh();
    //第2連絡先
    if (this.parts.isNhAndArriveUsa) {
      this.passengerSecondContactFc.setValue(this.data.passengerSecondContactDestination);
      const hasSecondContactCountry = this.parts.phoneCountrySecondContact.find((phoneCountry) => {
        return phoneCountry.countryCode === this.data.passengerSecondContactCountry;
      });
      this.secondContactCountryCodeFc.setValue(hasSecondContactCountry ? this.data.passengerSecondContactCountry : '');
      this.secondContactCountryPhoneExtension =
        this.parts.country.find((country) => country.country_2letter_code === this.data.passengerSecondContactCountry)
          ?.international_tel_country_code ?? '';
      this.secondContactNumberFc.setValue(this.data.passengerSecondContactNumber);
      this.secondContactOwnerFc.setValue(this.data.passengerSecondContactOwnerOfPhone);
      this.secondContactNumberValidatorRefresh();
    }

    this.change.markForCheck();
  }

  public update(isTached: boolean = false) {
    let isError = false;
    this._data.passengerMailDestination = this.passengerMailDestinationFc.value ?? '';
    this._data.passengerMailAddress = this.passengerMailAddressFc.value ?? '';
    this._data.passengerMailAddressConfirm = this.passengerMailAddressConfirmFc.value ?? '';

    // 電話国番号、電話番号、電話番号国の画面変数更新
    this._data.passengerSMSCountryNumber = this.countryPhoneExtension;
    if (this.parts.isDisplayPassengerSMSDestination) {
      this._data.passengerSMSDestination = this.passengerSMSDestinationFc.value ?? '';
      this._data.passengerSMSCountry = this.phoneCountryCodeFc.value ?? '';
      this._data.passengerSMSNumber = this.phoneNumberFc.value ?? '';
    } else {
      this._data.passengerSMSDestination = PassengerPhoneDestinationType.NOT_SEND;
      this._data.passengerSMSCountry = '';
      this._data.passengerSMSNumber = '';
    }
    //第2連絡先
    if (this.parts.isNhAndArriveUsa) {
      this._data.passengerSecondContactDestination = this.passengerSecondContactFc.value ?? '';
      this._data.passengerSecondContactCountry = this.secondContactCountryCodeFc.value ?? '';
      this._data.passengerSecondContactCountryNumber = this.secondContactCountryPhoneExtension;
      this._data.passengerSecondContactNumber = this.secondContactNumberFc.value ?? '';
      this._data.passengerSecondContactOwnerOfPhone = this.secondContactOwnerFc.value ?? '';
    }

    const checkList: Array<FormControl> = [this.passengerMailDestinationFc, this.passengerSMSDestinationFc];
    if (this._data.passengerMailDestination === PassengerMailDestinationType.INDIVIDUAL) {
      checkList.push(this.passengerMailAddressFc, this.passengerMailAddressConfirmFc);
      if (
        (!isStringEmpty(this._data.passengerMailAddressConfirm) || isTached) &&
        checkFormEqual(
          this.passengerMailAddressFc,
          this.passengerMailAddressConfirmFc,
          PassengerInformationRequestPassengerContactConfirmEmailError
        )
      ) {
        isError = true;
      }
    }
    if (this._data.passengerSMSDestination === PassengerPhoneDestinationType.INDIVIDUAL) {
      checkList.push(this.phoneCountryCodeFc, this.phoneNumberFc);
    }
    //第2連絡先
    if (
      this.parts.isNhAndArriveUsa &&
      this._data.passengerSecondContactDestination === PassengerSecondContactType.INDIVIDUAL
    ) {
      checkList.push(
        this.passengerSecondContactFc,
        this.secondContactCountryCodeFc,
        this.secondContactNumberFc,
        this.secondContactOwnerFc
      );
    }
    if (checkFormListValidate(checkList, isTached)) {
      isError = true;
    }
    this._data.isError = isError;
    this.dataChange.emit(this._data);
  }

  _data = initialPassengerInformationRequestPassengerContactData();
  _parts = initialPassengerInformationRequestPassengerContactParts();
  setDataEvent(): void {
    this.refresh();
  }
  setPartsEvent(): void {
    this.refresh();
  }

  public countryPhoneExtension = '';
  public secondContactCountryPhoneExtension = '';

  //電話番号バリデータ
  private _phoneValidatorOption: ValidatePhoneNumberOptions = {
    telCountryCode: this.countryPhoneExtension,
    isSmsSend: true,
    params: PassengerInformationRequestPassengerContactParams.number,
  };
  //第2連絡先電話番号バリデータ
  private _secondContactValidatorOption: ValidatePhoneNumberOptions = {
    telCountryCode: this.secondContactCountryPhoneExtension,
    isSmsSend: true,
    params: PassengerInformationRequestPassengerContactParams.number,
  };

  public passengerMailDestinationFc = new FormControl('', [
    AswValidators.required({
      isNotInput: true,
      params: PassengerInformationRequestPassengerContactParams.emailDestination,
    }),
  ]);
  public passengerMailAddressFc = new FormControl('', [
    AswValidators.required({ params: PassengerInformationRequestPassengerContactParams.email }),
    AswValidators.email({ params: PassengerInformationRequestPassengerContactParams.email }),
  ]);
  public passengerMailAddressConfirmFc = new FormControl('', [
    AswValidators.required({ params: PassengerInformationRequestPassengerContactParams.confirmEmail }),
    AswValidators.email({ params: PassengerInformationRequestPassengerContactParams.confirmEmail }),
  ]);
  public passengerSMSDestinationFc = new FormControl('', [
    AswValidators.required({
      isNotInput: true,
      params: PassengerInformationRequestPassengerContactParams.phoneDestination,
    }),
  ]);
  public phoneCountryCodeFc = new FormControl(
    '',
    AswValidators.required({ isNotInput: true, params: PassengerInformationRequestPassengerContactParams.countryCode })
  );
  public phoneNumberFc = new FormControl('', [
    AswValidators.required({ params: PassengerInformationRequestPassengerContactParams.number }),
    AswValidators.numeric({ params: PassengerInformationRequestPassengerContactParams.number }),
  ]);

  public passengerSecondContactFc = new FormControl();
  public secondContactCountryCodeFc = new FormControl(
    '',
    AswValidators.required({ isNotInput: true, params: PassengerInformationRequestPassengerContactParams.countryCode })
  );
  public secondContactNumberFc = new FormControl('', [
    AswValidators.required({ params: PassengerInformationRequestPassengerContactParams.number }),
    AswValidators.numeric({ params: PassengerInformationRequestPassengerContactParams.number }),
  ]);

  public secondContactOwnerFc = new FormControl('', [
    AswValidators.required({ params: PassengerInformationRequestPassengerContactParams.ownerOfPhone }),
    AswValidators.alphaNumericSpace({ params: PassengerInformationRequestPassengerContactParams.ownerOfPhone }),
    AswValidators.lengths(PassengerInformationRequestPassengerContactParams.ownerOfPhoneMinCheckParams),
  ]);

  /**
   * 電話番号国変更処理
   * @param event
   */
  changeCountry(event: SelectComponent) {
    this.countryPhoneExtension =
      this.parts.country.find((country) => country.country_2letter_code === event.data)
        ?.international_tel_country_code ?? '';
    //国が変わったのでバリデータに最新値をセットする
    this.phoneNumberValidatorRefresh();
    this.update();
  }

  /**
   * 第2連絡先電話番号国変更処理
   * @param event
   */
  changeSecondContactCountry(event: SelectComponent) {
    this.secondContactCountryPhoneExtension =
      this.parts.country.find((country) => country.country_2letter_code === event.data)
        ?.international_tel_country_code ?? '';
    //国が変わったのでバリデータに最新値をセットする
    this.secondContactNumberValidatorRefresh();
    this.update();
  }

  /**
   * 電話番号部品のバリデータのリフレッシュ
   */
  phoneNumberValidatorRefresh() {
    this._phoneValidatorOption.telCountryCode = this.countryPhoneExtension;
    this.phoneNumberFc.setValidators([
      AswValidators.required({ params: PassengerInformationRequestPassengerContactParams.number }),
      AswValidators.phoneNumber(this._phoneValidatorOption),
      AswValidators.numeric({ params: PassengerInformationRequestPassengerContactParams.number }),
    ]);
    if (this.phoneNumberFc.touched || !isStringEmpty(this.phoneNumberFc.value ?? '')) {
      this.phoneNumberFc.updateValueAndValidity();
      this.phoneNumberFc.markAllAsTouched();
    }
  }

  /**
   * 第2連絡先のバリデータのリフレッシュ
   */
  secondContactNumberValidatorRefresh() {
    this._secondContactValidatorOption.telCountryCode = this.secondContactCountryPhoneExtension;
    this.secondContactNumberFc.setValidators([
      AswValidators.required({ params: PassengerInformationRequestPassengerContactParams.number }),
      AswValidators.phoneNumber(this._secondContactValidatorOption),
      AswValidators.numeric({ params: PassengerInformationRequestPassengerContactParams.number }),
    ]);
    if (this.secondContactNumberFc.touched || !isStringEmpty(this.secondContactNumberFc.value ?? '')) {
      this.secondContactNumberFc.updateValueAndValidity();
      this.secondContactNumberFc.markAllAsTouched();
    }
  }
}
