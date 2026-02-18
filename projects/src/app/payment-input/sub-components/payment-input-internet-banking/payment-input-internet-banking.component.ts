import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ChangeDetectorRef } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { AswValidators } from '@lib/helpers';
import { CommonLibService } from '@lib/services';
import { AswContextType, LoginStatusType } from '@lib/interfaces';
import { SubComponentModelComponent } from '@common/components/feature-parts/sub-conponent-model/sub-component-model.component';
import {
  PaymentInputInternetBankingData,
  PaymentInputInternetBankingParts,
  initPaymentInputInternetBankingData,
  initPaymentInputInternetBankingParts,
} from './payment-input-internet-banking.state';
import { MBankWellnet } from '@common/interfaces/common/m_bank_wellnet';
/**
 * payment-input-internet-banking
 * 支払方法；インターネットバンキング
 */
@Component({
  selector: 'asw-payment-input-internet-banking',
  templateUrl: './payment-input-internet-banking.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentInputInternetBankingComponent extends SubComponentModelComponent<
  PaymentInputInternetBankingData,
  PaymentInputInternetBankingParts
> {
  // SubComponentModelComponent用設定
  _data = initPaymentInputInternetBankingData();
  _parts = initPaymentInputInternetBankingParts();
  setDataEvent() {
    this.refresh();
  }
  setPartsEvent() {
    const hasAvailableBank = this.availableBankList.find((availableBank) => {
      return availableBank.bank_code === this.parts.bankCode;
    });
    this.bankFormGroup.get('currentBank')?.setValue(hasAvailableBank ? this.parts.bankCode : '');
    this._data.bankCode = this.parts.bankCode;
    this.refresh();
    this.bankChange();
  }

  @Input() availableBankList: Array<MBankWellnet> = [];
  @Input() amcBasic: boolean = true;

  @Output() bankChangeEvent = new EventEmitter<string>();

  public isRealLogin = false;
  public bankFormGroup: FormGroup;
  // チェックボックス状態
  public saveAsUsualCheckboxControl: FormControl = new FormControl();
  // 選択された銀行
  private _currentBank = '';

  constructor(private _common: CommonLibService, private _changeDetectorRef: ChangeDetectorRef) {
    super(_changeDetectorRef, _common);
    //銀行リスト
    this.bankFormGroup = new FormGroup({
      currentBank: new FormControl('', [
        AswValidators.required({
          isNotInput: true,
          params: { key: 0, value: 'label.availableFinancialInstitutions' },
        }),
      ]),
    });
  }

  /**
   * SubComponentModelComponent用情報流入時更新用関数
   */
  refresh() {
    this.saveAsUsualCheckboxControl.setValue(this._data.isSaveAsUsualChecked);
    this._changeDetectorRef.markForCheck();
  }

  /**
   * SubComponentModelComponent用データ引き渡し関数
   */
  update() {
    if (this._data === undefined) this._data = initPaymentInputInternetBankingData();
    this._data.isSaveAsUsualChecked = this.saveAsUsualCheckboxControl.value ?? false;
    this._data.isBankFormValid = this.bankFormGroup.valid;
    this._data.bankCode = this._currentBank;
    this.dataChange.emit(this._data);
  }

  invokeValidation() {
    this.bankFormGroup.markAllAsTouched();
    this.update();
  }

  /**
   * 画面情報表示処理用
   */
  resetPartsEvent() {
    this._data.isSaveAsUsualChecked = false;
    this.setPartsEvent();
  }

  reload(): void {}

  init(): void {
    this.subscribeService(
      'internet-banking-watch-real-login-status',
      this._common.aswContextStoreService.getAswContextByKey$(AswContextType.LOGIN_STATUS),
      (loginStatus: LoginStatusType) => {
        this.isRealLogin = loginStatus === 'REAL_LOGIN';
      }
    );
  }

  destroy(): void {
    this.deleteSubscription('internet-banking-watch-real-login-status');
  }

  /**
   * 銀行選択で変更があった時のイベント
   */
  bankChange() {
    this._currentBank = this.bankFormGroup.controls['currentBank'].value;
    this.update();
    this.bankChangeEvent.emit(this._currentBank);
  }
}
