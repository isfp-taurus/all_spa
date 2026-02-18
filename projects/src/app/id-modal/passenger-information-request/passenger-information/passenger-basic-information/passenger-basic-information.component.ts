import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { AswValidators } from '@lib/helpers';
import { CommonLibService } from '@lib/services';
import { SubComponentModelComponent } from '@common/components/feature-parts/sub-conponent-model/sub-component-model.component';
import { checkFormListTouched, checkFormListValidate } from '@common/helper';
import { SelectDateYmdComponent } from '@lib/components';
import {
  PassengerInformationRequestPassengerBasicInformationData,
  PassengerInformationRequestPassengerBasicInformationParts,
  initialPassengerInformationRequestPassengerBasicInformationData,
  initialPassengerInformationRequestPassengerBasicInformationParts,
  PassengerInformationReplaceParamMap,
  PassengerInformationRequestPassengerBasicInfoLastNameErrorInfo,
  PassengerInformationRequestPassengerBasicInfoErrorInfo,
  PassengerInformationRequestPassengerBasicInfoFirstNameErrorInfo,
  PassengerInformationRequestPassengerBasicInformationNameDisp,
} from './passenger-basic-information.state';
import { ValidationErrorInfo } from '@lib/interfaces';
import { filter, Subscription } from 'rxjs';
import { CurrentCartStoreService } from '@common/services';

const nameLengthValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const firstNameFc = control.get('firstNameFc')?.value;
  const middleNameFc = control.get('middleNameFc')?.value;
  const lastNameFc = control.get('lastNameFc')?.value;
  const isName40Error = `${firstNameFc}${middleNameFc}${lastNameFc}`.length >= 41;
  const isName25Error = `${firstNameFc}${middleNameFc}`.length >= 26;
  if (isName40Error) {
    control.get('lastNameFc')?.setErrors(PassengerInformationRequestPassengerBasicInfoLastNameErrorInfo);
    control.get('middleNameFc')?.setErrors(PassengerInformationRequestPassengerBasicInfoErrorInfo);
    control.get('firstNameFc')?.setErrors(PassengerInformationRequestPassengerBasicInfoErrorInfo);
  } else if (isName25Error) {
    control.get('middleNameFc')?.setErrors(PassengerInformationRequestPassengerBasicInfoErrorInfo);
    control.get('firstNameFc')?.setErrors(PassengerInformationRequestPassengerBasicInfoFirstNameErrorInfo);
  }
  return null;
};
/**
 * passenger-information-request
 * 搭乗者基本情報
 */

@Component({
  selector: 'asw-passenger-information-request-passenger-basic-info',
  templateUrl: './passenger-basic-information.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PassengerInformationRequestPassengerBasicInformationComponent
  extends SubComponentModelComponent<
    PassengerInformationRequestPassengerBasicInformationData,
    PassengerInformationRequestPassengerBasicInformationParts
  >
  implements AfterViewInit
{
  @ViewChild('selectDateYmd') selectDateYmdComp?: SelectDateYmdComponent;
  //フォームコントロール作成
  public titleFc = new FormControl();

  public selectYmdControlFc = new FormControl();
  public genderFc = new FormControl(
    '',
    AswValidators.required({ isNotInput: true, params: PassengerInformationReplaceParamMap.genderParams })
  );
  public _isRefresh = false;

  /** 国内単独旅程フラグ */
  public isDomestic = false;

  public formGroup!: FormGroup;

  /**
   * ngOnDestroyにunsubscribeを実行
   */
  private _subscriptions: Subscription = new Subscription();

  //姓名ミドルネーム、表示順変動のため配列として保持し、条件で順番を入れ替える
  public firstNameDisp: PassengerInformationRequestPassengerBasicInformationNameDisp = {
    name: 'firstName',
    reader: 'reader.firstName.passengerInput',
    label: 'label.firstName',
    placeholder: 'placeholder.firstName',
    required: true,
    maxlength: '25',
  };
  public middleNameDisp: PassengerInformationRequestPassengerBasicInformationNameDisp = {
    name: 'middleName',
    reader: 'reader.middleName',
    label: 'label.middleName',
    placeholder: 'placeholder.middleName',
    required: false,
    maxlength: '25',
  };
  public lastNameDisp: PassengerInformationRequestPassengerBasicInformationNameDisp = {
    name: 'lastName',
    reader: 'reader.lastName.passengerInput',
    label: 'label.lastName',
    placeholder: 'placeholder.lastName',
    required: true,
    maxlength: '30',
  };

  public namesDisp: Array<PassengerInformationRequestPassengerBasicInformationNameDisp> = [
    this.firstNameDisp,
    this.middleNameDisp,
    this.lastNameDisp,
  ];
  public isErrorDateYmd = false;
  public selectedDateYmd: Date | null = new Date();
  public errorMsg: string | ValidationErrorInfo = '';
  public namesDispMap: { [key: string]: Array<PassengerInformationRequestPassengerBasicInformationNameDisp> } = {
    '0': [this.firstNameDisp, this.middleNameDisp, this.lastNameDisp],
    '1': [this.lastNameDisp, this.firstNameDisp, this.middleNameDisp],
    '2': [this.lastNameDisp, this.middleNameDisp, this.firstNameDisp],
  };

  constructor(
    public change: ChangeDetectorRef,
    protected _common: CommonLibService,
    private _currentCartStoreService: CurrentCartStoreService
  ) {
    super(change, _common);
    // 国内旅程判定処理
    this.isDomestic = this._currentCartStoreService.CurrentCartData.data?.plan?.airOffer?.tripType === 'domestic';
    this.formGroup = new FormGroup(
      {
        firstNameFc: new FormControl('', [
          AswValidators.required({ params: PassengerInformationReplaceParamMap.firstNameParams }),
          AswValidators.alpha({ params: PassengerInformationReplaceParamMap.firstNameParams }),
        ]),
        middleNameFc: new FormControl('', [
          AswValidators.alpha({ params: PassengerInformationReplaceParamMap.middleNameParams }),
        ]),
        lastNameFc: new FormControl('', [
          AswValidators.required({ params: PassengerInformationReplaceParamMap.lastNameNameParams }),
          AswValidators.alpha({ params: PassengerInformationReplaceParamMap.lastNameNameParams }),
          AswValidators.lengths(PassengerInformationReplaceParamMap.lastNameMinCheckParams),
        ]),
      },
      nameLengthValidator
    );

    this._subscriptions.add(
      this.formGroup.controls['firstNameFc'].valueChanges.pipe(filter(() => !this._isRefresh)).subscribe(() => {
        if (this.formGroup.controls['lastNameFc'].value) {
          this.formGroup.controls['lastNameFc'].markAsTouched();
        }
        if (this.formGroup.controls['middleNameFc'].value) {
          this.formGroup.controls['middleNameFc'].markAsTouched();
        }

        this.formGroup.controls['middleNameFc'].updateValueAndValidity({ onlySelf: true, emitEvent: false });
        this.formGroup.controls['lastNameFc'].updateValueAndValidity({ onlySelf: true, emitEvent: false });
        this.update();
      })
    );
    this._subscriptions.add(
      this.formGroup.controls['middleNameFc'].valueChanges.pipe(filter(() => !this._isRefresh)).subscribe(() => {
        if (this.formGroup.controls['firstNameFc'].value) {
          this.formGroup.controls['firstNameFc'].markAsTouched();
        }
        if (this.formGroup.controls['lastNameFc'].value) {
          this.formGroup.controls['lastNameFc'].markAsTouched();
        }
        this.formGroup.controls['firstNameFc'].updateValueAndValidity({ onlySelf: true, emitEvent: false });
        this.formGroup.controls['lastNameFc'].updateValueAndValidity({ onlySelf: true, emitEvent: false });
        this.update();
      })
    );
    this._subscriptions.add(
      this.formGroup.controls['lastNameFc'].valueChanges.pipe(filter(() => !this._isRefresh)).subscribe(() => {
        if (this.formGroup.controls['firstNameFc'].value) {
          this.formGroup.controls['firstNameFc'].markAsTouched();
        }
        if (this.formGroup.controls['middleNameFc'].value) {
          this.formGroup.controls['middleNameFc'].markAsTouched();
        }
        this.formGroup.controls['firstNameFc'].updateValueAndValidity({ onlySelf: true, emitEvent: false });
        this.formGroup.controls['middleNameFc'].updateValueAndValidity({ onlySelf: true, emitEvent: false });
        this.update();
      })
    );
  }

  // 初期値の設定
  ngAfterViewInit(): void {
    if (this.selectDateYmdComp) {
      this.selectDateYmdComp.dateFrom = this.parts.selectDate.dateFrom;
      this.selectDateYmdComp.dateTo = this.parts.selectDate.dateTo;
      this.selectDateYmdComp.initialDate = this.parts.selectDate.initialDate;
      this.selectDateYmdComp.refresh();
      this.change.detectChanges();
    }
  }
  reload() {}
  init() {}
  destroy() {
    this._subscriptions.unsubscribe();
  }

  _data = initialPassengerInformationRequestPassengerBasicInformationData();
  _parts = initialPassengerInformationRequestPassengerBasicInformationParts();
  setPartsEvent() {
    this.refresh();
  }
  setDataEvent() {
    this.refresh(true);
  }

  public refresh(isDataUpdate: boolean = false) {
    this._isRefresh = true;
    //姓名ミドルネームの順番を入れ替えnamesDispMap
    this.namesDisp = this.namesDispMap[this.parts.order];

    if (isDataUpdate) {
      this.formGroup.controls['firstNameFc'].setValue(this.data.firstName);
      this.formGroup.controls['middleNameFc'].setValue(this.data.middleName);
      this.formGroup.controls['lastNameFc'].setValue(this.data.lastName);
      this.genderFc.setValue(this.data.gender);
      this.selectedDateYmd = this.data.selectYmd;
    }

    if (this.selectDateYmdComp) {
      this.selectDateYmdComp.dateFrom = this.parts.selectDate.dateFrom;
      this.selectDateYmdComp.dateTo = this.parts.selectDate.dateTo;
      if (this._data.selectYmd) {
        this.selectDateYmdComp.initialDate = {
          year: this._data.selectYmd.getFullYear(),
          month: this._data.selectYmd.getMonth() + 1,
          day: this._data.selectYmd.getDate(),
        };
      } else {
        this.selectDateYmdComp.initialDate = this.parts.selectDate.initialDate;
      }
      this.selectDateYmdComp.order = this.parts.selectDate.order;
      this.selectDateYmdComp.refresh();
    }
    this._isRefresh = false;
    this.change.detectChanges();
  }

  public update(isTached: boolean = false) {
    let isError = false;
    this._data.firstName = this.formGroup.controls['firstNameFc'].value ?? '';
    this._data.middleName = this.formGroup.controls['middleNameFc'].value ?? '';
    this._data.lastName = this.formGroup.controls['lastNameFc'].value ?? '';
    this._data.selectYmd = this.selectedDateYmd;
    this._data.gender = this.genderFc.value ?? '';
    if (isTached) {
      isError = checkFormListTouched([this.genderFc], true);
    }

    //年月日プルダウンのエラーチェック
    if (isTached && !(this.selectDateYmdComp?.isError === true) && this._data.selectYmd === null) {
      this.errorMsg = { errorMsgId: 'E0700', params: { key: '0', value: 'label.dateOfBirthForMandatory' } };
      isError = true;
    }
    if (this.selectDateYmdComp?.isError) {
      isError = true;
    }
    this._data.isError = isError || this.formGroup.invalid;
    this.dataChange.emit(this._data);
  }

  /**
   * 生年月日変更処理
   * @param date 変更された生年月日
   */
  changeBirth(date: Date | null) {
    this.selectedDateYmd = date;
    this._data.selectYmd = this.selectedDateYmd;
    if (this.selectedDateYmd === null) {
      return;
    } else {
      if ((this._data.selectYmd !== null && this.errorMsg !== '') || this.selectDateYmdComp?.isError !== null) {
        this.errorMsg = '';
        this.change.detectChanges();
      }
    }
  }
}
