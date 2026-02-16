import { ChangeDetectionStrategy, Component, EventEmitter, Output, ChangeDetectorRef } from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  FormBuilder,
  FormControlStatus,
  ValidatorFn,
  AbstractControl,
} from '@angular/forms';
import { CommonLibService } from '@lib/services';
import { SubComponentModelComponent } from '@common/components/feature-parts/sub-conponent-model/sub-component-model.component';
import {
  PaymentInputRequestPaymentInputSkyCoinUsageData,
  PaymentInputRequestPaymentInputSkyCoinUsageParts,
  initPaymentInputSkyCoinUsageData,
  initPaymentInputSkyCoinUsageParts,
} from './payment-input-sky-coin-usage.state';
import { AswValidators } from '@lib/helpers/validate/validators';
import { GetAwardUsersStoreService } from '@lib/services/get-award-users-store/get-award-users-store.service';
import { fromEvent } from 'rxjs';
import { throttleTime } from 'rxjs/operators';
import { isSP, isTB, isPC } from '@lib/helpers/common/common.helper';
import { AnaSkyCoinInfo } from '../../../container/payment-input-cont.state';
import { DecimalPipe, registerLocaleData } from '@angular/common';
import { ValidateOptions, ValidationErrorInfo, ValidateNumericRangeOptions } from '@lib/interfaces';
import { matchedRegexPattern } from '@lib/helpers';
import localeJa from '@angular/common/locales/ja';
registerLocaleData(localeJa);

/**
 * payment-input-sky-coin-usage
 * 支払方法；ANA SKYコイン
 * ANA SKYコイン 情報入力エリアコンポーネント
 */
@Component({
  selector: 'asw-payment-input-sky-coin-usage',
  templateUrl: './payment-input-sky-coin-usage.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentInputSkyCoinUsageComponent extends SubComponentModelComponent<
  PaymentInputRequestPaymentInputSkyCoinUsageData,
  PaymentInputRequestPaymentInputSkyCoinUsageParts
> {
  // SubComponentModelComponent用初期設定
  _data = initPaymentInputSkyCoinUsageData();
  _parts = initPaymentInputSkyCoinUsageParts();
  setDataEvent() {
    this.refresh();
  }

  setPartsEvent() {
    this.skyCoinUsageControl.clear();
    this._skyCoinUsageInput = [];
    this.parts.anaSkyCoinInfo.forEach((anaSkyCoinInfo) => {
      this.skyCoinUsageControl.push(
        new FormControl(
          {
            // 初期値
            value: this.getInitialValueOfSkyCoinUsage(anaSkyCoinInfo),
            //非活性条件
            disabled: !((anaSkyCoinInfo?.ticketPrice ?? 0) > 0 && this.existAwardUser(anaSkyCoinInfo.travelerName)),
          },
          [
            // 必須チェック
            AswValidators.required({ params: { key: 0, value: 'label.anaSkyCoin' } }),
            PaymentInputSkyCoinUsageComponent.amounts({ params: { key: 0, value: 'label.anaSkyCoin' } }),
            // AswValidators.numeric({ params: { key: 0, value: 'label.anaSkyCoin' } }),
            // 数字でかつ充当可能上限コイン(切り上げ)以下
            PaymentInputSkyCoinUsageComponent.amountsRange({
              min: 0,
              max: anaSkyCoinInfo.ticketPrice ? anaSkyCoinInfo.ticketPrice : 0,
              errorMsgId: 'E0537',
            }),
            PaymentInputSkyCoinUsageComponent.amountsRange({
              min: 0,
              max: 9999990,
              errorMsgId: 'E0014',
              params: [
                { key: 0, value: 'label.anaSkyCoin' },
                { key: 1, value: 0 },
                { key: 2, value: 9999990 },
              ],
            }),
            // 0で終わること
            AswValidators.pattern({
              pattern: '0$',
              errorMsgId: 'E0536',
            }),
          ]
        )
      );
      this._skyCoinUsageInput.push(anaSkyCoinInfo);
      this.skyCoinUsageControl.markAllAsTouched();
      this.totalUseCoinStatusChangeEvent.emit(this.skyCoinUsageControl.status);
    });
    this.update();
    this.refresh();
  }

  @Output() skyCoinToggleEvent = new EventEmitter<Event>();
  @Output() updateAnaSkyCoinSummary = new EventEmitter<Event>();
  @Output() totalUseCoinStatusChangeEvent = new EventEmitter<FormControlStatus>();
  @Output() usageCoinFocusEvent = new EventEmitter<Event>();

  public skyCoinForm: FormGroup = this._fb.group({
    skyCoinUsageControl: this._fb.array([]),
  });

  private _skyCoinUsageInput: Array<AnaSkyCoinInfo> = [];
  private _decimalPipe: DecimalPipe = new DecimalPipe('ja-JP');

  //画面のサイズを切り替えの設定
  public isSp = isSP();
  public isTb = isTB();
  public isPc = isPC();
  private _isSpPre = isSP();
  private _isTbPre = isTB();
  private _isPcPre = isPC();

  constructor(
    private _common: CommonLibService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _fb: FormBuilder,
    private _getAwardStoreService: GetAwardUsersStoreService
  ) {
    super(_changeDetectorRef, _common);
  }

  get skyCoinUsageControl(): FormArray<FormControl> {
    return this.skyCoinForm.get('skyCoinUsageControl') as FormArray;
  }

  public refresh() {
    this._changeDetectorRef.markForCheck();
  }
  public update() {
    this._data.usageCoin = this._skyCoinUsageInput;
    this._data.validation = this.skyCoinForm.disabled || this.skyCoinForm.valid;
    this.dataChange.emit(this._data);
  }

  invokeValidation() {
    this.skyCoinUsageControl.markAllAsTouched();
    this.update();
  }

  /**
   * 画面情報表示処理用
   */
  resetPartsEvent(): void {
    this.data.usageCoin = this.parts.anaSkyCoinInfo;
    for (let i = 0; i < this.skyCoinUsageControl.length; i++) {
      this.skyCoinUsageControl.controls[i].setValue(this.data.usageCoin[i].usageCoin);
    }
    this.usageCoinBlur();
  }

  reload(): void {}
  init(): void {
    this.usageCoinBlur();

    //画面のサイズを切り替えの設定
    this.subscribeService(
      'paymentInputPres_subHeaderResize',
      fromEvent(window, 'resize').pipe(throttleTime(500)),
      this.resizeEvent
    );

    this.subscribeService('totalUseCoinStatusChanges', this.skyCoinUsageControl.statusChanges, (status) => {
      this.totalUseCoinStatusChangeEvent.emit(status);
    });
  }

  destroy(): void {}

  /**
   * 画面のサイズを切り替えの設定
   */
  private resizeEvent = () => {
    this._isSpPre = this.isSp;
    this._isTbPre = this.isTb;
    this._isPcPre = this.isPc;
    this.isSp = isSP();
    this.isTb = isTB();
    this.isPc = isPC();
    if (this._isSpPre !== this.isSp || this._isTbPre !== this.isTb || this._isPcPre !== this.isPc) {
      this._changeDetectorRef.markForCheck();
    }
  };

  skyCoinToggle() {
    this.skyCoinToggleEvent.emit();
  }

  /**
   * ANA SKY コイン利用額 Blurイベント
   */
  usageCoinBlur() {
    for (let i = 0; i < this.skyCoinUsageControl.length; i++) {
      const formControl = this.skyCoinUsageControl.controls[i];
      const usageCoin =
        formControl.value !== undefined && formControl.value !== null ? (formControl.value + '').replace(/,/g, '') : '';

      this._skyCoinUsageInput[i].usageCoin = Number(usageCoin);
      formControl.setValue(this._decimalPipe.transform(usageCoin, '1.0-0'));
    }
    this.refresh();
    this.skyCoinUsageControl.updateValueAndValidity();
    this.update();
    this.updateAnaSkyCoinSummary.emit();
  }

  /**
   * ANA SKY コイン利用額 Focusイベント
   * @param index skyCoinUsageControlのインデックス
   */
  usageCoinFocus(index: number) {
    const formControl = this.skyCoinUsageControl.controls[index];
    const usageCoin =
      formControl.value !== undefined && formControl.value !== null ? (formControl.value + '').replace(/,/g, '') : '';
    formControl.setValue(usageCoin);
    this.refresh();
  }

  /**
   * awardUsersが存在するかどうか判定関数
   * @param name 敬称を含む搭乗者名前
   * @returns awardUsersが存在するかどうか
   */
  existAwardUser(name?: string): boolean {
    if (!name) return false;
    let awardUserNameList =
      this._getAwardStoreService.getAwardUsersData.data?.awardUsers?.map((users) =>
        (users.name + '')?.replace(/[/\s]/g, '')
      ) ?? [];
    const parts = name.trim().split(' ');
    const [firstName, lastName] = parts.slice(-2);
    return awardUserNameList.some((awardUser) => awardUser === lastName + firstName);
  }

  /**
   * ANA SKY コイン利用額の初期値を取得する
   * @param anaSkyCoinInfo ANA SKY コイン情報
   * @return ANA SKY コイン利用額入力欄初期値
   */
  private getInitialValueOfSkyCoinUsage(anaSkyCoinInfo: AnaSkyCoinInfo): number | string {
    const ticketPrice = anaSkyCoinInfo?.ticketPrice ?? 0;
    // 当該搭乗者の支払金額が存在しない場合
    if (ticketPrice <= 0) {
      return '';
    }
    // Mindに登録されている特典利用者以外の場合
    if (!this.existAwardUser(anaSkyCoinInfo.travelerName)) {
      return '';
    }

    const skyCoinBalance = this._common.amcMemberStoreService.amcMemberData?.skyCoinBalance ?? 0;
    let usageCoin = Math.ceil((ticketPrice <= skyCoinBalance ? ticketPrice : skyCoinBalance) / 10) * 10;

    // クレジットからのスカイコイン併用の場合は利用額をゼロにする
    if (this.parts.selectedPaymentMethod === 'CD') {
      usageCoin = 0;
    }

    return this._decimalPipe.transform(usageCoin, '1.0-0') ?? '';
  }

  /* 金額チェック
   *
   * @static
   * @param {?ValidateOptions} [option] （任意）{@link ValidateOptions}
   * @returns {ValidatorFn}
   */
  static amounts(option?: ValidateOptions): ValidatorFn {
    return amountsValidator(option);
  }

  /**
   * 値範囲チェック
   *
   * @static
   * @param {ValidateNumericRangeOptions} option （必須）{@link ValidateNumericRangeOptions}
   * @returns {ValidatorFn}
   */
  static amountsRange(option: ValidateNumericRangeOptions): ValidatorFn {
    return amountsRangeValidator(option);
  }
}

/**
 * 金額チェック
 *
 * @param {string} data チェック対象
 * @returns {boolean}
 */
export function isAmounts(data: string): boolean {
  return matchedRegexPattern((data + '').replace(/,/g, ''), '^[0-9]*$');
}

/**
 * 金額チェックValidator
 *
 * @param {?ValidateOptions} [option]
 * @returns {ValidatorFn}
 */
export function amountsValidator(option?: ValidateOptions): ValidatorFn {
  return (control: AbstractControl): { [key: string]: ValidationErrorInfo } | null => {
    // valueの値が存在し、かつ数字の正規表現とマッチしない場合エラー情報を返却
    if (control.value && !isAmounts(control?.value)) {
      return {
        'validate-numeric': {
          errorMsgId: option?.errorMsgId || 'E0003',
          params: option?.params,
        },
      };
    }
    return null;
  };
}

/**
 * 値範囲チェックValidator
 *
 * @param {ValidateNumericRangeOptions} option
 * @returns {ValidatorFn}
 */
export function amountsRangeValidator(option: ValidateNumericRangeOptions): ValidatorFn {
  // チェックエラー時の戻り値定義
  const validationError = (defMsgId: string, defOnlyFlg?: boolean) => {
    const { errorMsgId = defMsgId, params } = option;
    return {
      'validate-numeric-range': {
        errorMsgId: defOnlyFlg ? defMsgId : errorMsgId,
        params: params,
      },
    };
  };

  return (control: AbstractControl): { [key: string]: ValidationErrorInfo } | null => {
    if (!control.value) {
      return null;
    }
    // 数字チェック
    if (!isAmounts(control.value)) {
      return validationError('E0011', true);
    }
    const checkedValue = Number((control.value + '').replace(/,/g, ''));
    const { min, max } = option;
    // 値範囲（最小・最大）チェック
    // valueとminとmaxの値が存在し、valueはminの値より小さい、またはmaxの値より大きい場合、チェックNGとする
    if (min && max && (min > checkedValue || max < checkedValue)) {
      return validationError('E0014');
      // 値範囲（最小）チェック
      // valueとminの値が存在し、かつvalueはminの値より小さい場合、チェックNGとする
    } else if (min && !max && min > checkedValue) {
      return validationError('E0012');
      // 値範囲（最大）チェック
      // valueとmaxの値が存在し、かつvalueはmaxの値より大きい場合、チェックNGとする
    } else if (!min && max && max < checkedValue) {
      return validationError('E0013');
    }
    return null;
  };
}
