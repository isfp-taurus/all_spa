import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { SubComponentModelComponent } from '@common/components/feature-parts/sub-conponent-model/sub-component-model.component';
import { isStringEmpty } from '@common/helper';
import { RegistrationLabelType } from '@common/interfaces';
import { AswValidators } from '@lib/helpers';
import { ValidatePhoneNumberOptions, ValidationErrorInfo } from '@lib/interfaces';
import { CommonLibService, PageLoadingService } from '@lib/services';
import { initialPassengerInformationRequestInputCompleteOperationparts } from '../common-component/passenger-input-complete-operation-area/passenger-input-complete-operation-area.state';
import { PassengerInformationRequestRepresentativeInformationService } from './representative-information.service';
import {
  initialPassengerInformationRequestRepresentativeInformationData,
  initialPassengerInformationRequestRepresentativeInformationParts,
  PassengerInformationRequestRepresentativeInformationConfirmEmailParams,
  PassengerInformationRequestRepresentativeInformationCountryCodeParams,
  PassengerInformationRequestRepresentativeInformationData,
  PassengerInformationRequestRepresentativeInformationEmailParams,
  PassengerInformationRequestRepresentativeInformationNumberParams,
  PassengerInformationRequestRepresentativeInformationParts,
} from './representative-information.state';
import { filter, Subscription } from 'rxjs';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

const emailConfirmValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const email = control.get('representativeEmailFc')?.value;
  const emailAgain = control.get('representativeConfirmEmailFc')?.value;
  if (email && emailAgain && email !== emailAgain) {
    control.get('representativeConfirmEmailFc')?.setErrors({
      'validate-email': {
        errorMsgId: 'E0461',
        params: {
          key: 0,
          value: 'label.confirmMailAddress',
        },
      },
    });
  }
  return null;
};
/**
 * passenger-information-request
 * 代表者連絡先情報ブロック
 */

@Component({
  selector: 'asw-passenger-information-request-representative',
  templateUrl: './representative-information.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['../passenger-information-request.scss'],
})
export class PassengerInformationRequestRepresentativeInformationComponent extends SubComponentModelComponent<
  PassengerInformationRequestRepresentativeInformationData,
  PassengerInformationRequestRepresentativeInformationParts
> {
  _data = initialPassengerInformationRequestRepresentativeInformationData();
  _parts = initialPassengerInformationRequestRepresentativeInformationParts();
  setDataEvent(): void {
    this.refresh();
  }
  setPartsEvent(): void {
    this.refresh();
  }

  @Input()
  set isOpen(value: boolean) {
    this._isOpen = value;
    this.change.markForCheck();
  }
  get isOpen() {
    return this._isOpen;
  }
  public _isOpen: boolean = false;
  @Output()
  isOpenChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Output()
  public clickNextEvent: EventEmitter<void> = new EventEmitter<void>();
  @Output()
  public clickSaveEvent: EventEmitter<void> = new EventEmitter<void>();
  @Output()
  public phoneTypeEvent: EventEmitter<{ code: string; type: string; number: string }> = new EventEmitter<{
    code: string;
    type: string;
    number: string;
  }>();
  // 登録状況が未登録か
  public isNotRegistered = false;

  public formGroup!: FormGroup;

  // 初期化の判断
  private _isRefresh = false;

  //
  public inputCompleteOperationData = initialPassengerInformationRequestInputCompleteOperationparts();
  public radioBoxErrorInfo: ValidationErrorInfo | string = '';
  public boxRadioLabel: Array<string> = [];
  public boxRadioLabelMap: Array<{ value: string; disp: string }> = [];
  public selectedTellType: string = '';
  public registrarionClass = '';
  public countryPhoneExtension = '';
  //電話番号バリデータ
  private _phoneValidatorOption: ValidatePhoneNumberOptions = {
    telCountryCode: this.countryPhoneExtension,
    isSmsSend: false,
    params: PassengerInformationRequestRepresentativeInformationNumberParams,
  };

  /**
   * ngOnDestroyにunsubscribeを実行
   */
  private _subscriptions: Subscription = new Subscription();

  constructor(
    public change: ChangeDetectorRef,
    private _service: PassengerInformationRequestRepresentativeInformationService,
    private _common: CommonLibService,
    private _pageloadingService: PageLoadingService
  ) {
    super(change, _common);
    this._pageloadingService.startLoading();
    this.formGroup = new FormGroup(
      {
        representativeEmailFc: new FormControl('', [
          AswValidators.required({ params: PassengerInformationRequestRepresentativeInformationEmailParams }),
          AswValidators.email({ params: PassengerInformationRequestRepresentativeInformationEmailParams }),
        ]),
        representativeConfirmEmailFc: new FormControl('', [
          AswValidators.required({ params: PassengerInformationRequestRepresentativeInformationConfirmEmailParams }),
          AswValidators.email({ params: PassengerInformationRequestRepresentativeInformationConfirmEmailParams }),
        ]),
        phoneCountryCodeFc: new FormControl('', [
          AswValidators.required({
            isNotInput: true,
            params: PassengerInformationRequestRepresentativeInformationCountryCodeParams,
          }),
        ]),
        phoneNumberFc: new FormControl('', [
          AswValidators.required({ params: PassengerInformationRequestRepresentativeInformationNumberParams }),
          AswValidators.numeric({ params: PassengerInformationRequestRepresentativeInformationNumberParams }),
        ]),
      },
      emailConfirmValidator
    );
    this._subscriptions.add(
      this.formGroup.controls['representativeEmailFc'].valueChanges
        .pipe(filter(() => !this._isRefresh))
        .subscribe(() => {
          if (this.formGroup.controls['representativeConfirmEmailFc'].value) {
            this.formGroup.controls['representativeConfirmEmailFc'].markAsTouched();
          }
          this.formGroup.controls['representativeConfirmEmailFc'].updateValueAndValidity({
            onlySelf: true,
            emitEvent: false,
          });
          this.update();
        })
    );
    this._subscriptions.add(
      this.formGroup.controls['representativeConfirmEmailFc'].valueChanges
        .pipe(filter(() => !this._isRefresh))
        .subscribe(() => {
          this.update();
        })
    );
    this._subscriptions.add(
      this.formGroup.controls['phoneCountryCodeFc'].valueChanges.pipe(filter(() => !this._isRefresh)).subscribe((e) => {
        this.update();
        this.changeCountry(e);
      })
    );
    this._subscriptions.add(
      this.formGroup.controls['phoneNumberFc'].valueChanges.pipe(filter(() => !this._isRefresh)).subscribe((e) => {
        this.update();
        this.changePhoneNumber();
      })
    );
  }

  reload() {}
  init() {}
  destroy() {
    this._subscriptions.unsubscribe();
  }

  //初期化処理
  refresh() {
    this._isRefresh = true;
    this.formGroup.controls['representativeEmailFc'].setValue(this.data.email);
    this.formGroup.controls['representativeConfirmEmailFc'].setValue(this.data.emailConfirm);
    const hasPhoneCountry = this.parts.phoneCountry.find((phoneCountry) => {
      return phoneCountry.countryCode === this.data.phoneCountry;
    });
    this.formGroup.controls['phoneCountryCodeFc'].setValue(hasPhoneCountry ? this.data.phoneCountry : '');
    this.formGroup.controls['phoneNumberFc'].setValue(this.data.phoneNumber);
    this.countryPhoneExtension =
      this.parts.country.find((country) => country.country_2letter_code === this.data.phoneCountry)
        ?.international_tel_country_code ?? '';
    this.phoneNumberValidatorRefresh();
    //代表者連絡先情報のボックスラジオボタン選択肢作成
    this.boxRadioLabelMap = this._service.createPhoneTypeBoxRadio(this.parts.pd010);
    this.boxRadioLabel = this.boxRadioLabelMap.map((item) => item.disp);
    const tellType = this.data.tellType;
    const _selectedTellType = this.boxRadioLabelMap.find((item) => item.value === tellType)?.disp ?? '';
    if (_selectedTellType !== '') {
      this.selectedTellType = _selectedTellType;
    }
    this.registrarionClass = this._service.getRegistrationLabelClass(this.parts.registrarionLabel);
    this.inputCompleteOperationData.nextAction = this.parts.nextAction;
    this.inputCompleteOperationData.nextButtonLabel = 'label.proceed';
    this.inputCompleteOperationData.saveButtonLabel = 'label.saveAndBacktoPlan';
    this.isNotRegistered = this.parts.registrarionLabel === RegistrationLabelType.NOT_REGISTERED;
    this.change.markForCheck();
    this._pageloadingService.endLoading();
    this._isRefresh = false;
  }

  /**
   * shutter押下イベント
   */
  clickShutter() {
    if (this.parts.registrarionLabel !== RegistrationLabelType.NOT_REGISTERED) {
      this.isOpen = true;
      this.isOpenChange.emit(this.isOpen);
    }
  }

  /**
   * shuttertクローズ押下イベント
   */
  clickShutterClose() {
    this.isOpen = false;
    this.isOpenChange.emit(this.isOpen);
  }

  /**
   * 入力値の更新を反映
   * @param isTached フォームコントロールの更新　trueで必須チェックエラーを起動させる
   */
  public update(isTached: boolean = false) {
    let isError = false;
    this._data.email = this.formGroup.controls['representativeEmailFc'].value ?? '';
    this._data.emailConfirm = this.formGroup.controls['representativeConfirmEmailFc'].value ?? '';
    this._data.phoneCountry = this.formGroup.controls['phoneCountryCodeFc'].value ?? '';
    this._data.phoneCountryNumber = this.countryPhoneExtension;
    this._data.phoneNumber = this.formGroup.controls['phoneNumberFc'].value ?? '';

    //必須チェックエラー情報
    if (this.parts.registrarionLabel === RegistrationLabelType.EDITTING) {
      if (isTached && this._data.tellType === '') {
        this.radioBoxErrorInfo = {
          errorMsgId: 'E0002',
        };
        isError = true;
      } else {
        this.radioBoxErrorInfo = '';
      }
      if (isTached) {
        this.formGroup.markAllAsTouched();
      }
    }

    this._data.isError = isError || this.formGroup.invalid;
    this.change.markForCheck();
    this.dataChange.emit(this._data);
  }

  /**
   * 電話種別変更時イベント
   * @param event
   */
  public changeTellType(event: string) {
    const _selectedTellType = this.boxRadioLabelMap.find((item) => item.disp === event)?.value ?? '';
    if (_selectedTellType !== '') {
      const type = _selectedTellType;
      if (this._data.tellType !== type) {
        this._data.tellType = type;
        //親に通知する
        this.phoneTypeEvent.emit({ code: this.data.phoneCountry, type: type, number: this._data.phoneNumber });
      }
    }
  }

  /**
   * 電話番号国変更処理
   * @param data
   */
  changeCountry(data: string) {
    this.countryPhoneExtension =
      this.parts.country.find((country) => country.country_2letter_code === data)?.international_tel_country_code ?? '';
    //国が変わったのでバリデータに最新値をセットする
    this.phoneNumberValidatorRefresh();
    this.phoneTypeEvent.emit({
      code: this._data.phoneCountry,
      type: this._data.tellType,
      number: this._data.phoneNumber,
    });
  }

  /**
   * 電話番号部品のバリデータのリフレッシュ
   */
  phoneNumberValidatorRefresh() {
    this._phoneValidatorOption.telCountryCode = this.countryPhoneExtension;
    this.formGroup.controls['phoneNumberFc'].setValidators([
      AswValidators.required({ params: PassengerInformationRequestRepresentativeInformationNumberParams }),
      AswValidators.phoneNumber(this._phoneValidatorOption),
      AswValidators.numeric({ params: PassengerInformationRequestRepresentativeInformationNumberParams }),
    ]);
    if (
      this.formGroup.controls['phoneNumberFc'].touched ||
      !isStringEmpty(this.formGroup.controls['phoneNumberFc'].value ?? '')
    ) {
      this.formGroup.controls['phoneNumberFc'].updateValueAndValidity({
        onlySelf: true,
        emitEvent: false,
      });
      this.formGroup.controls['phoneNumberFc'].markAsTouched();
    }
  }

  /**
   * 電話番号変更時イベント
   */
  changePhoneNumber() {
    this.phoneTypeEvent.emit({
      code: this._data.phoneCountry,
      type: this._data.tellType,
      number: this._data.phoneNumber,
    });
  }

  /**
   * 次へボタン押下時処理
   * */
  clickNextButton() {
    this.clickNextEvent.emit();
  }
  /**
   * 保存してプランに戻るボタン押下時処理
   * */
  clickSaveButton() {
    this.clickSaveEvent.emit();
  }

  /**
   * 外部呼出し用 強制refresh
   * */
  public refreshForce() {
    this.refresh();
  }

  /**
   * 外部呼出し用 強制update
   * */
  public updateForce(isTached: boolean = false) {
    this.update(isTached);
  }
}
