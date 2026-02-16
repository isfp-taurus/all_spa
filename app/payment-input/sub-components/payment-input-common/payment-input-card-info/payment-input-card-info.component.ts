import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { PaymentInputCardInfo, PaymentInputInitMOffice } from '@app/payment-input/container/payment-input-cont.state';
import { SubComponentModelComponent } from '@common/components/feature-parts/sub-conponent-model/sub-component-model.component';
import { CommonLibService } from '@lib/services';
import {
  PaymentInputRequestCardInformationData,
  PaymentInputRequestCardInformationParts,
  initialPaymentInputRequestCardInformationData,
  initialPaymentInputRequestCardInformationParts,
  CardBrandEnum,
} from './payment-input-card-info.state';
import { MOffice } from '@lib/interfaces';
import { CardBrandImageMapType, CardBrandImageMap } from './payment-input-card-info.state';
import { RegisteredCardTypeEnum } from '../payment-input-card-selecting/payment-input-card-selecting.state';
import { PaymentMethodsType } from '@common/interfaces/common/payment-methods';
import { PaymentInputCardInfoService } from './payment-input-card-info.service';
import { LocalDateService } from '@common/services';

/**
 * payment-input-card-info
 * 支払方法：クレジットカード(カード情報)
 */
@Component({
  selector: 'asw-payment-input-card-info',
  templateUrl: './payment-input-card-info.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentInputRequestCardInformationComponent extends SubComponentModelComponent<
  PaymentInputRequestCardInformationData,
  PaymentInputRequestCardInformationParts
> {
  // SubComponentModelComponent用初期設定
  _data = initialPaymentInputRequestCardInformationData();
  _parts = initialPaymentInputRequestCardInformationParts();
  setDataEvent(): void {
    this.selectedCreditCardNumber = this.data.cardNumber;
    this._prevCardName = this.selectedCard;
    this.selectedCard = this.data.selectedCard;
    if (this._prevCardName !== this.selectedCard) {
      this.cardInfoFormGroup.patchValue({
        cardNumber: this.data.cardNumber,
        cardExpiryDate: this.data.cardExpiryDate,
        ownerName: this.data.ownerName,
      });
      this.cardInfoFormGroup.markAsUntouched();
    }
    this.refresh();
  }
  setPartsEvent(): void {
    this.refresh();
  }
  // 有効期限選択可能範囲
  @Input() yearRange!: number;
  // 操作オフィス情報
  @Input()
  set currentOfficeInfo(value: MOffice) {
    this._currentOfficeInfo = value;

    const originCardbrandMap = CardBrandImageMap;
    value.card_brand_pattern.split(',').forEach((brand) => {
      const name = originCardbrandMap.get(brand as CardBrandEnum);
      if (name) {
        this.CardBrandImageMap.set(brand as CardBrandEnum, name);
      }
    });
    this._changeDetectorRef.markForCheck();
  }
  get currentOfficeInfo(): MOffice {
    return this._currentOfficeInfo;
  }
  private _currentOfficeInfo: MOffice = PaymentInputInitMOffice();
  private _prevCardName: string = '';

  // 選択クレジットカードナンバー
  public selectedCreditCardNumber: string = '';
  // 選択クレジットカード
  public selectedCard: RegisteredCardTypeEnum = RegisteredCardTypeEnum.NewCard;
  // UATPカード選択チェックボックス表示可否
  public isDisplayUtapCheckbox: boolean = false;
  // 予約基本情報のクレジットカード登録情報・更新チェック表示可否
  public isDisplayCardUpdateCheckbox: boolean = false;
  // 予約基本情報にクレジットカード情報があるかどうか
  private _existRegisterCreditCard: boolean = false;
  // カードブランドアイコン名前マップ
  public CardBrandImageMap: CardBrandImageMapType = new Map<CardBrandEnum, string>();
  // カードブランドaltプロパティキー
  private altTextMap: { [key: string]: string } = {
    cardlogo_visa: 'alt.availableCardBrandVI',
    cardlogo_mastercard: 'alt.availableCardBrandCA',
    cardlogo_jcb: 'alt.availableCardBrandJC',
    cardlogo_americanexpress: 'alt.availableCardBrandAX',
    cardlogo_dinersclub: 'alt.availableCardBrandDC',
  };

  // スカイコイン支払フラグ
  @Input()
  set isSkyCoinSelected(value: boolean) {
    this._isSkyCoinSelected = value;
    this.cardInfoFormGroup = this._paymentInputCardInfoService.initCardInfoFormGroup(value);
  }
  get isSkyCoinSelected(): boolean {
    return this._isSkyCoinSelected;
  }
  private _isSkyCoinSelected: boolean = false;
  // 操作オフィス情報

  // カード情報フォームグループ定義
  public cardInfoFormGroup: FormGroup;

  constructor(
    protected _common: CommonLibService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _paymentInputCardInfoService: PaymentInputCardInfoService,
    private _localDateService: LocalDateService
  ) {
    super(_changeDetectorRef, _common);

    //yearRange
    const today = this._localDateService.getCurrentDateStr();
    this.yearRange = new Date(today).getFullYear();

    // クレジットカード情報フォームグループ

    this.cardInfoFormGroup = this._paymentInputCardInfoService.initCardInfoFormGroup(this.isSkyCoinSelected);
  }

  public refresh() {
    this._changeDetectorRef.markForCheck();
  }

  public update(paymentMethod?: string) {
    this._data.cardExpiryDate = this.cardInfoFormGroup.controls['cardExpiryDate'].value ?? '';
    this._data.ownerName = this.cardInfoFormGroup.controls['ownerName'].value ?? '';
    this._data.cardNumber = this.cardInfoFormGroup.controls['cardNumber'].value ?? '';
    this._data.cvv = this.cardInfoFormGroup.controls['securityCode'].value ?? '';
    this._data.uatpCard = this.cardInfoFormGroup.controls['uatpCard'].value ?? false;
    this._data.reservation = this.cardInfoFormGroup.controls['reservation'].value ?? false;
    if (
      paymentMethod &&
      paymentMethod === PaymentMethodsType.ANA_SKY_COIN &&
      !this._data.cardNumber &&
      !this._data.cardExpiryDate &&
      !this._data.ownerName &&
      (!this._data.cvv || this._data.uatpCard)
    ) {
      this._data.validation = true;
    } else {
      this._data.validation = this.cardInfoFormGroup.valid;
    }
    this._data = { ...this._data };
    this.dataChange.emit(this._data);
  }

  invokeValidation(paymentMethod?: string) {
    this.cardInfoFormGroup.markAllAsTouched();
    this.update(paymentMethod);
  }

  /**
   * 画面情報表示処理用
   */
  resetPartsEvent(): void {
    const data: PaymentInputCardInfo = {
      uatpCard: this.parts.uatpCard ?? false, // UATP
      cardNumber: this.parts.cardNumber ?? '', // カード番号
      cardExpiryDate: this.parts.cardExpiryDate ?? '', // 有効期限
      cvv: this.parts.securityCode ?? '', // CVV
      ownerName: this.parts.cardName ?? '', // 名義
      reservation: this.parts.reservation ?? false, // 登録
    };

    this.cardInfoFormGroup.setValue({
      uatpCard: data.uatpCard ?? false, // UATP
      cardNumber: data.cardNumber ?? '', // カード番号
      cardExpiryDate: data.cardExpiryDate ?? '', // 有効期限
      securityCode: data.cvv ?? '', // CVV
      securityCodeDisabled: '', // CVV
      ownerName: data.ownerName ?? '', // 名義
      reservation: data.reservation ?? false, // 登録
    });
    this._changeDetectorRef.markForCheck();
    this.refresh();
  }

  /**
   * CVV入力 活性/非活性のため、UATPカードのチェックボックスを取り込む
   */
  public get cvvDisabled() {
    if (this.cardInfoFormGroup.controls['uatpCard'].value) {
      this.cardInfoFormGroup.controls['securityCode']?.disable();
      this.cardInfoFormGroup.controls['securityCodeDisabled']?.disable();
    } else {
      this.cardInfoFormGroup.controls['securityCode']?.enable();
      this.cardInfoFormGroup.controls['securityCodeDisabled']?.enable();
    }
    this.update();
    return this.cardInfoFormGroup.controls['uatpCard'].value;
  }

  /**
   * cardNumber入力 活性/非活性
   */
  public cardNumberDisabled() {
    if (this.data.selectedCard === RegisteredCardTypeEnum.NewCard) {
      this.cardInfoFormGroup.controls['cardNumber']?.enable();
    } else {
      this.cardInfoFormGroup.controls['cardNumber']?.disable();
    }
  }

  /**
   * カードブランドのaltプロパティキーを取得
   */
  getAltText(item: string): string {
    return this.altTextMap[item] || 'alt.creditCard';
  }

  /**
   * カード番号変更イベント
   */
  cardNumberChange() {
    this.update();
  }

  /**
   * 有効期限変更イベント
   */
  expiryChange() {
    this.update();
  }

  /**
   * セキュリティコード変更イベント
   */
  cvvChange() {
    this.update();
  }

  /**
   * 名義人変更イベント
   */
  holderNameChange() {
    this.update();
  }
  /**
   * カード登録番号変更イベント
   */
  registerChange() {
    this.update();
  }

  reload(): void {}

  init(): void {}

  destroy(): void {}
}
