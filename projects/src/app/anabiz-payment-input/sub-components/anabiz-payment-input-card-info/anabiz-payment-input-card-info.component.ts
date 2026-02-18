import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidatorFn } from '@angular/forms';
import { AnabizCreditCardInformation } from '@app/anabiz-payment-input/container/anabiz-payment-input-cont.state';
import { PaymentInputInitMOffice } from '@app/payment-input/container/payment-input-cont.state';
import {
  CardBrandImageMapType,
  CardBrandImageMap,
  CardBrandEnum,
} from '@app/payment-input/sub-components/payment-input-common/payment-input-card-info/payment-input-card-info.state';
import { SupportComponent } from '@lib/components/support-class';
import { isSP, isTB, isPC, AswValidators } from '@lib/helpers';
import { LoginStatusType, ValidateOptions, ValidationErrorInfo, MOffice } from '@lib/interfaces';
import { CommonLibService } from '@lib/services';
import { requiredYmValidator } from './anabiz-payment-input-card-info.state';
import { PaymentInputCardInfoService } from '../../../payment-input/sub-components/payment-input-common/payment-input-card-info/payment-input-card-info.service';
import { initAnabizCreditCardInformation } from '../../container/anabiz-payment-input-cont.state';
import { LocalDateService } from '@common/services';
@Component({
  selector: 'asw-anabiz-payment-input-card-info',
  templateUrl: './anabiz-payment-input-card-info.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnabizPaymentInputCardInfoComponent extends SupportComponent {
  // 選択クレジットカードナンバー
  public selectedCreditCardNumber: string = '';
  // 選択クレジットカード有効期限
  public expiryDate: string = '';
  // 選択クレジットカード
  @Input() public selectedCard: string = 'other';
  // UATPカード選択チェックボックス表示可否
  public isDisplayUtapCheckbox: boolean = false;
  // カードブランドアイコン名前マップ
  public CardBrandImageMap: CardBrandImageMapType = new Map<CardBrandEnum, string>();
  // 有効期限選択可能範囲
  yearRange: number = new Date(this._localDateService.getCurrentDateStr()).getFullYear();
  // カードブランドaltプロパティキー
  private altTextMap: { [key: string]: string } = {
    cardlogo_visa: 'alt.availableCardBrandVI',
    cardlogo_mastercard: 'alt.availableCardBrandCA',
    cardlogo_jcb: 'alt.availableCardBrandJC',
    cardlogo_americanexpress: 'alt.availableCardBrandAX',
    cardlogo_dinersclub: 'alt.availableCardBrandDC',
  };
  // クレジットカード情報
  @Input() set creditCardInfo(value: AnabizCreditCardInformation) {
    this._creditCardInfo = value;
    this.creditCardInfoChange.emit(value);
  }
  get creditCardInfo(): AnabizCreditCardInformation {
    return this._creditCardInfo;
  }
  private _creditCardInfo: AnabizCreditCardInformation = initAnabizCreditCardInformation();
  @Output() creditCardInfoChange = new EventEmitter<AnabizCreditCardInformation>();

  // 操作オフィス情報
  @Input()
  set currentOfficeInfo(value: MOffice) {
    this._currentOfficeInfo = value;
    this.isDisplayUtapCheckbox = value.card_brand_pattern.includes('TP');

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

  // カード情報フォームグループ定義
  public cardInfoFormGroup: FormGroup;

  constructor(
    protected _common: CommonLibService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _paymentInputCardInfoService: PaymentInputCardInfoService,
    private _localDateService: LocalDateService
  ) {
    super(_common);
    const today = this._localDateService.getCurrentDateStr();
    this.yearRange = new Date(today).getFullYear();

    // クレジットカード情報フォームグループ
    this.cardInfoFormGroup = new FormGroup({
      // UATP
      uatpCard: new FormControl(false, []),
      // クレジットカード番号
      cardNumber: new FormControl('', [
        AswValidators.required({ params: { key: 0, value: 'label.creditCardNumber' } }),
        AswValidators.numeric({ params: { key: 0, value: 'label.creditCardNumber' } }),
        AswValidators.lengths({
          min: 11,
          errorMsgId: 'E0544',
          params: [
            { key: 0, value: 11, dontTranslate: true },
            { key: 1, value: 16, dontTranslate: true },
          ],
        }),
      ]),
      // 有効期限
      cardExpiryDate: new FormControl('', [
        requiredYmValidator({ params: { key: 0, value: 'label.expirationDate' } }),
        AswValidators.numeric({ params: { key: 0, value: 'label.expirationDate' } }),
        this.checkValidDate({ params: { key: 0, value: 'label.expirationDate' } }),
      ]),
      // CVV
      securityCode: new FormControl('', [
        AswValidators.required({ params: { key: 0, value: 'label.securityCode' } }),
        AswValidators.numeric({ params: { key: 0, value: 'label.securityCode' } }),
        AswValidators.lengths({
          min: 3,
          errorMsgId: 'E0544',
          params: [
            { key: 0, value: 3, dontTranslate: true },
            { key: 1, value: 4, dontTranslate: true },
          ],
        }),
      ]),
      // CVV
      securityCodeDisabled: new FormControl('_ _ _'),
      // カード名義
      ownerName: new FormControl('', [
        AswValidators.required({ params: { key: 0, value: 'label.cardholderName' } }),
        AswValidators.alphaSpace({ params: { key: 0, value: 'label.cardholderName' } }),
      ]),
    });
  }

  /**
   * 画面情報表示処理用
   */
  resetCreditCardFormGroup(): void {
    this.cardInfoFormGroup.setValue({
      uatpCard: this.creditCardInfo?.isUatpCard ?? false, // UATP
      cardNumber: this.creditCardInfo?.cardNumber ?? '', // カード番号
      cardExpiryDate: this._paymentInputCardInfoService.convertToDateYmFormData(this.creditCardInfo?.expiryDate ?? ''), // 有効期限
      securityCode: this.creditCardInfo?.securityCode ?? '', // CVV
      securityCodeDisabled: '',
      ownerName: this.creditCardInfo?.holderName ?? '', // 名義
    });
    this.selectedCreditCardNumber = this.creditCardInfo?.cardNumber ?? '';
    this.cardInfoFormGroup.markAsUntouched();
    this.refresh();
    this._changeDetectorRef.markForCheck();
  }

  /**
   * バリデーションチェック
   */
  isValid() {
    const validity = this.cardInfoFormGroup.valid;
    this.cardInfoFormGroup.markAllAsTouched();
    this._changeDetectorRef.detectChanges();
    return validity;
  }

  reload(): void {}

  /**
   * 初期表示
   */
  init(): void {
    this.refresh();
  }

  destroy(): void {
    this.deleteSubscription('anaBizPaymentInputCreditCard_basicReservationInformation_cardInfo');
  }

  public refresh() {
    this._changeDetectorRef.markForCheck();
  }

  //画面のサイズを切り替えの設定
  public isSp = isSP();
  public isTb = isTB();
  public isPc = isPC();
  private _isSpPre = isSP();
  private _isTbPre = isTB();
  private _isPcPre = isPC();

  /**
   * カード番号変更イベント
   */
  cardNumberChange() {
    this.creditCardInfo!.cardNumber = this.cardInfoFormGroup.controls['cardNumber'].value;
  }

  /**
   * 有効期限変更イベント
   */
  expiryChange() {
    this.creditCardInfo!.expiryDate = this.cardInfoFormGroup.controls['cardExpiryDate'].value;
  }

  /**
   * セキュリティコード変更イベント
   */
  cvvChange() {
    this.creditCardInfo!.securityCode = this.cardInfoFormGroup.controls['securityCode'].value;
  }

  /**
   * 名義人変更イベント
   */
  holderNameChange() {
    this.creditCardInfo!.holderName = this.cardInfoFormGroup.controls['ownerName'].value;
  }

  /**
   *  有効期限日が過去日であるか判断
   *
   *  @param option　バリデータオプション
   *　@returns バリデータ
   */
  checkValidDate(option: ValidateOptions): ValidatorFn {
    return (control: AbstractControl): { [key: string]: ValidationErrorInfo } | null => {
      if (control.value && control.value.length === 6) {
        const nowDate = this._localDateService.getCurrentDateStr('YYYYMM');
        if (Number(control.value) < Number(nowDate)) {
          return {
            'validate-required-selectYm': {
              errorMsgId: option?.errorMsgId || 'E1767',
              params: option?.params,
            },
          };
        } else {
          return null;
        }
      } else {
        return {
          'validate-required-selectYm': {
            errorMsgId: option?.errorMsgId || 'E0700',
            params: option?.params,
          },
        };
      }
    };
  }

  /**
   * カードブランドのaltプロパティキーを取得
   */
  getAltText(item: string): string {
    return this.altTextMap[item] || 'alt.creditCard';
  }
}
