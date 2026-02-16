import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { CommonLibService } from '@lib/services';
import { checkFormEqual, checkFormListValidate, isStringEmpty } from '@common/helper';
import { SubComponentModelComponent } from '@common/components/feature-parts/sub-conponent-model/sub-component-model.component';
import {
  PassengerInformationRequestPassengerArrivalAndDepartureNoticeData,
  PassengerInformationRequestPassengerArrivalAndDepartureNoticeParts,
  initialPassengerInformationRequestPassengerArrivalAndDepartureNoticeData,
  initialPassengerInformationRequestPassengerArrivalAndDepartureNoticeParts,
  PassengerInformationRequestPassengerArrivalAndDepartureNoticeConfirmEmailError,
  PassengerInformationRequestPassengerArrivalAndDepartureNoticeParams,
} from './passenger-arrival-and-departure-notice.state';
import { PassengerInformationRequestPassengerArrivalAndDepartureNoticeService } from './passenger-arrival-and-departure-notice.service';
import { AswValidators } from '@lib/helpers';

/**
 * passenger-information-request
 * 発着通知連絡先情報
 */

@Component({
  selector: 'asw-passenger-information-request-passenger-arrival-departure-notice',
  templateUrl: './passenger-arrival-and-departure-notice.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PassengerInformationRequestPassengerArrivalAndDepartureNoticeComponent extends SubComponentModelComponent<
  PassengerInformationRequestPassengerArrivalAndDepartureNoticeData,
  PassengerInformationRequestPassengerArrivalAndDepartureNoticeParts
> {
  _data = initialPassengerInformationRequestPassengerArrivalAndDepartureNoticeData();
  _parts = initialPassengerInformationRequestPassengerArrivalAndDepartureNoticeParts();
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

  constructor(
    public change: ChangeDetectorRef,
    protected _common: CommonLibService,
    private _service: PassengerInformationRequestPassengerArrivalAndDepartureNoticeService
  ) {
    super(change, _common);
  }

  reload() {}
  init() {}
  destroy() {}

  refresh() {
    this.mailRecipientName.setValue(this.data.mailRecipientName);
    this.mailAddress.setValue(this.data.mailAddress);
    this.confirmMailAddress.setValue(this.data.confirmMailAddress);
    if (this.parts.isLang && this._service.checkLang(this.data.mailLang, this.parts.langList)) {
      this.mailLang.setValue(this.data.mailLang);
    }
    this.mailRecipientName2.setValue(this.data.mailRecipientName2);
    this.mailAddress2.setValue(this.data.mailAddress2);
    this.confirmMailAddress2.setValue(this.data.confirmMailAddress2);
    if (this.parts.isLang && this._service.checkLang(this.data.mailLang2, this.parts.langList)) {
      this.mailLang2.setValue(this.data.mailLang2);
    }
    this.isOpen = this.isOpen || this.parts.isOpen;
  }
  update(isTached: boolean = false) {
    const checkList = [];
    this._data.mailRecipientName = this.mailRecipientName.value ?? '';
    this._data.mailAddress = this.mailAddress.value ?? '';
    this._data.confirmMailAddress = this.confirmMailAddress.value ?? '';
    this._data.mailLang = this.mailLang.value ?? '';
    if (
      !isStringEmpty(this._data.mailRecipientName) ||
      !isStringEmpty(this._data.mailAddress) ||
      !isStringEmpty(this._data.confirmMailAddress) ||
      !isStringEmpty(this._data.mailLang)
    ) {
      //　発着通知先1のいずれかに入力がある場合
      this.enableRequired1();
      checkList.push(this.mailRecipientName, this.mailAddress, this.confirmMailAddress);
    } else {
      this.disableRequired1();
    }

    this._data.mailRecipientName2 = this.mailRecipientName2.value ?? '';
    this._data.mailAddress2 = this.mailAddress2.value ?? '';
    this._data.confirmMailAddress2 = this.confirmMailAddress2.value ?? '';
    this._data.mailLang2 = this.mailLang2.value ?? '';
    if (
      !isStringEmpty(this._data.mailRecipientName2) ||
      !isStringEmpty(this._data.mailAddress2) ||
      !isStringEmpty(this._data.confirmMailAddress2) ||
      !isStringEmpty(this._data.mailLang2)
    ) {
      //　発着通知先2のいずれかに入力がある場合
      this.enableRequired2();
      checkList.push(this.mailRecipientName2, this.mailAddress2, this.confirmMailAddress2);
    } else {
      this.disableRequired2();
    }

    if (this.parts.isLang) {
      // 言語が表示されている場合言語もチェック対象に追加
      checkList.push(this.mailLang, this.mailLang2);
    } else {
      //　非表示かつ項目が入力されている場合日本語に設定
      if (!isStringEmpty(this._data.mailRecipientName)) {
        this._data.mailLang = 'ja';
      }
      if (!isStringEmpty(this._data.mailRecipientName2)) {
        this._data.mailLang2 = 'ja';
      }
    }

    this._data.isError = checkFormListValidate(checkList, isTached);

    //メールアドレスチェック
    if (
      (!isStringEmpty(this._data.confirmMailAddress) || isTached) &&
      checkFormEqual(
        this.mailAddress,
        this.confirmMailAddress,
        PassengerInformationRequestPassengerArrivalAndDepartureNoticeConfirmEmailError
      )
    ) {
      this._data.isError = true;
    }
    if (
      (!isStringEmpty(this._data.confirmMailAddress2) || isTached) &&
      checkFormEqual(
        this.mailAddress2,
        this.confirmMailAddress2,
        PassengerInformationRequestPassengerArrivalAndDepartureNoticeConfirmEmailError
      )
    ) {
      this._data.isError = true;
    }
    this.dataChange.emit(this._data);
    this.change.markForCheck();
  }

  public mailRecipientName = new FormControl(
    '',
    AswValidators.alphaSpace({
      params: PassengerInformationRequestPassengerArrivalAndDepartureNoticeParams.recipient,
    })
  );
  public mailAddress = new FormControl(
    '',
    AswValidators.email({ params: PassengerInformationRequestPassengerArrivalAndDepartureNoticeParams.email })
  );
  public confirmMailAddress = new FormControl(
    '',
    AswValidators.email({ params: PassengerInformationRequestPassengerArrivalAndDepartureNoticeParams.confirmEmail })
  );
  public mailLang = new FormControl('');
  public mailRecipientName2 = new FormControl(
    '',
    AswValidators.alphaSpace({
      params: PassengerInformationRequestPassengerArrivalAndDepartureNoticeParams.recipient,
    })
  );
  public mailAddress2 = new FormControl(
    '',
    AswValidators.email({ params: PassengerInformationRequestPassengerArrivalAndDepartureNoticeParams.email })
  );
  public confirmMailAddress2 = new FormControl(
    '',
    AswValidators.email({ params: PassengerInformationRequestPassengerArrivalAndDepartureNoticeParams.confirmEmail })
  );
  public mailLang2 = new FormControl('');

  /** 開くボタン押下処理 （発着通知先パーツ） */
  public clickOpenArrivalDepartureAlerts() {
    this.isOpen = true;
    this.change.markForCheck();
  }

  /**
   * 必須の有効化
   */
  enableRequired1() {
    this.mailRecipientName.setValidators([
      AswValidators.required({
        params: PassengerInformationRequestPassengerArrivalAndDepartureNoticeParams.recipient,
      }),
      AswValidators.alphaSpace({
        params: PassengerInformationRequestPassengerArrivalAndDepartureNoticeParams.recipient,
      }),
    ]);
    this.mailAddress.setValidators([
      AswValidators.required({
        params: PassengerInformationRequestPassengerArrivalAndDepartureNoticeParams.email,
      }),
      AswValidators.email({ params: PassengerInformationRequestPassengerArrivalAndDepartureNoticeParams.email }),
    ]);

    this.confirmMailAddress.setValidators([
      AswValidators.required({
        params: PassengerInformationRequestPassengerArrivalAndDepartureNoticeParams.confirmEmail,
      }),
      AswValidators.email({ params: PassengerInformationRequestPassengerArrivalAndDepartureNoticeParams.confirmEmail }),
    ]);
    this.mailLang.setValidators([
      AswValidators.required({
        isNotInput: true,
        params: PassengerInformationRequestPassengerArrivalAndDepartureNoticeParams.lang,
      }),
    ]);
  }
  /**
   * 必須の無効化
   */
  disableRequired1() {
    this.mailRecipientName.setValidators([
      AswValidators.alphaSpace({
        params: PassengerInformationRequestPassengerArrivalAndDepartureNoticeParams.recipient,
      }),
    ]);
    this.mailRecipientName.setErrors(null);
    this.mailAddress.setValidators([
      AswValidators.email({ params: PassengerInformationRequestPassengerArrivalAndDepartureNoticeParams.email }),
    ]);
    this.mailAddress.setErrors(null);
    this.confirmMailAddress.setValidators([
      AswValidators.email({ params: PassengerInformationRequestPassengerArrivalAndDepartureNoticeParams.confirmEmail }),
    ]);
    this.confirmMailAddress.setErrors(null);
    this.mailLang.setValidators([]);
    this.mailLang.setErrors(null);
  }

  /**
   * 必須の有効化2
   */
  enableRequired2() {
    this.mailRecipientName2.setValidators([
      AswValidators.required({
        params: PassengerInformationRequestPassengerArrivalAndDepartureNoticeParams.recipient,
      }),
      AswValidators.alphaSpace({
        params: PassengerInformationRequestPassengerArrivalAndDepartureNoticeParams.recipient,
      }),
    ]);
    this.mailAddress2.setValidators([
      AswValidators.required({
        params: PassengerInformationRequestPassengerArrivalAndDepartureNoticeParams.email,
      }),
      AswValidators.email({ params: PassengerInformationRequestPassengerArrivalAndDepartureNoticeParams.email }),
    ]);

    this.confirmMailAddress2.setValidators([
      AswValidators.required({
        params: PassengerInformationRequestPassengerArrivalAndDepartureNoticeParams.confirmEmail,
      }),
      AswValidators.email({ params: PassengerInformationRequestPassengerArrivalAndDepartureNoticeParams.confirmEmail }),
    ]);
    this.mailLang2.setValidators([
      AswValidators.required({
        isNotInput: true,
        params: PassengerInformationRequestPassengerArrivalAndDepartureNoticeParams.lang,
      }),
    ]);
  }
  /**
   * 必須の無効化2
   */
  disableRequired2() {
    this.mailRecipientName2.setValidators([
      AswValidators.alphaSpace({
        params: PassengerInformationRequestPassengerArrivalAndDepartureNoticeParams.recipient,
      }),
    ]);
    this.mailRecipientName2.setErrors(null);
    this.mailAddress2.setValidators([
      AswValidators.email({ params: PassengerInformationRequestPassengerArrivalAndDepartureNoticeParams.email }),
    ]);
    this.mailAddress2.setErrors(null);
    this.confirmMailAddress2.setValidators([
      AswValidators.email({ params: PassengerInformationRequestPassengerArrivalAndDepartureNoticeParams.confirmEmail }),
    ]);
    this.confirmMailAddress2.setErrors(null);
    this.mailLang2.setValidators([]);
    this.mailLang2.setErrors(null);
  }
}
