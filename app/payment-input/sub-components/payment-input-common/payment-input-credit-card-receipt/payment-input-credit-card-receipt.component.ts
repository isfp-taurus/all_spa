import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { PaymentInputScreenEntryInfo, screenEntryData } from '@app/payment-input/container';
import { AswValidators } from '@lib/helpers';
import { CommonLibService } from '@lib/services';
import { SubComponentModelComponent } from '@common/components/feature-parts/sub-conponent-model/sub-component-model.component';
import {
  PaymentInputCreditCardReceiptData,
  initPaymentInputCreditCardReceiptData,
  PaymentInputCreditCardReceiptParts,
  initPaymentInputCreditCardReceiptParts,
} from './payment-input-credit-card-receipt.state';
import { AbstractControl, ValidatorFn } from '@angular/forms';
import { ValidateLengthOptions, ValidationErrorInfo } from '@lib/interfaces';

/**
 * payment-payment-input-credit-card-receipt
 * 支払方法；クレジットカード(領収書の発行名義)
 */
@Component({
  selector: 'asw-payment-input-credit-card-receipt',
  templateUrl: './payment-input-credit-card-receipt.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentInputCreditCardReceiptComponent extends SubComponentModelComponent<
  PaymentInputCreditCardReceiptData,
  PaymentInputCreditCardReceiptParts
> {
  // SubComponentModelComponent用初期設定
  _data = initPaymentInputCreditCardReceiptData();
  _parts = initPaymentInputCreditCardReceiptParts();
  setDataEvent(): void {
    this.refresh();
  }
  setPartsEvent(): void {
    this.receiptFormGroup.controls['receiptName'].setValue(this.parts.issueReceipt);
    this.refresh();
  }

  public receiptFormGroup: FormGroup;

  @Input() screenEntry: PaymentInputScreenEntryInfo = screenEntryData();

  @Input()
  set receiptName(value: string) {
    this._receiptName = value;
    this._changeDetectorRef.markForCheck();
  }
  get receiptName(): string {
    return this._receiptName;
  }
  private _receiptName: string = '';

  constructor(
    public change: ChangeDetectorRef,
    protected _common: CommonLibService,
    private _changeDetectorRef: ChangeDetectorRef
  ) {
    super(change, _common);
    // レシートフォームグループ
    this.receiptFormGroup = new FormGroup({
      // レシート
      receiptName: new FormControl(this.parts.issueReceipt, [
        AswValidators.required({ params: { key: 0, value: 'label.receiptName' } }),
        AswValidators.shiftJis({ params: { key: 0, value: 'label.receiptName' } }),
        lengthCheckValidator({ params: { key: 0, value: 'label.receiptName' } }),
      ]),
    });
  }

  /**
   * 領収書宛名変更イベント
   */
  receiptChange() {
    this.receiptName = this.receiptFormGroup.controls['receiptName'].value;
    this.update();
  }

  reload(): void {}

  init(): void {}

  destroy(): void {}

  public refresh() {
    this.change.markForCheck();
  }

  public update() {
    this._data.issueReceipt = this.receiptName;
    this._data.validation = this.receiptFormGroup.valid;
    this.dataChange.emit(this._data);
  }

  invokeValidation() {
    this.receiptFormGroup.markAllAsTouched();
    this.receiptChange();
  }

  /**
   * 画面情報表示処理用
   */
  resetPartsEvent(): void {
    this.setPartsEvent();
  }
}

/**
 *  桁数チェックValidator
 *
 * @param {ValidateLengthOptions} option
 * @returns {ValidatorFn}
 */
export function lengthCheckValidator(option: ValidateLengthOptions): ValidatorFn {
  // チェックエラー時の戻り値定義
  const validationError = {
    'validate-name': {
      errorMsgId: 'E0691',
      params: [
        {
          key: 0,
          value: 40,
        },
      ],
    },
  };

  return (control: AbstractControl): { [key: string]: ValidationErrorInfo } | null => {
    if (!control.value) {
      return null;
    }
    const dataLength = control.value.length;
    if (dataLength >= 41) {
      return validationError;
    }
    return null;
  };
}
