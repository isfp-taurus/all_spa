import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { FormControl, FormControlStatus } from '@angular/forms';
import {
  AnaSkyCoinInfo,
  PaymentInputCardHolderInfo,
  PaymentInputInitMOffice,
  screenEntryData,
  PaymentInputScreenEntryInfo,
} from '@app/payment-input/container/payment-input-cont.state';
import { CountryCodeNameType } from '@common/interfaces';
import { SubComponentModelComponent } from '@common/components/feature-parts/sub-conponent-model/sub-component-model.component';
import { isSP, isTB, isPC } from '@lib/helpers';
import { CommonLibService } from '@lib/services';
import { fromEvent, throttleTime } from 'rxjs';
import { GetOrderResponseData } from 'src/sdk-servicing';
import {
  initialPaymentInputRequestCardInformationData,
  PaymentInputRequestCardInformationData,
} from '../payment-input-common/payment-input-card-info/payment-input-card-info.state';
import {
  initPaymentInputCardHolderInfoData,
  PaymentInputCardHolderInfoData,
} from '../payment-input-common/payment-input-card-holder-info/payment-input-card-holder-info.state';
import {
  initPaymentInputSkyCoinBallancesData,
  PaymentInputRequestPaymentInputSkyCoinBallancesData,
} from '../payment-input-common/payment-input-sky-coin-ballances/payment-input-sky-coin-ballances.state';
import {
  initPaymentInputSkyCoinUsageData,
  PaymentInputRequestPaymentInputSkyCoinUsageData,
} from '../payment-input-common/payment-input-sky-coin-usage/payment-input-sky-coin-usage.state';
import {
  initPaymentInputSkyCoinSummaryData,
  PaymentInputRequestPaymentInputSkyCoinSummaryData,
} from '../payment-input-common/payment-input-sky-coin-summary/payment-input-sky-coin-summary.state';
import {
  PaymentInputCreditCardReceiptData,
  initPaymentInputCreditCardReceiptData,
} from '../payment-input-common/payment-input-credit-card-receipt/payment-input-credit-card-receipt.state';
import {
  PaymentInputRequestCreditCardData,
  initPaymentInputRequestCreditCardData,
  initPaymentInputRequestCreditCardParts,
  PaymentInputRequestCreditCardParts,
} from './payment-input-credit-card.state';
import { PaymentInputRequestCardInformationComponent } from '../payment-input-common/payment-input-card-info/payment-input-card-info.component';
import { PaymentInputCardHolderInfoComponent } from '../payment-input-common/payment-input-card-holder-info/payment-input-card-holder-info.component';
import { PaymentInputCreditCardReceiptComponent } from '../payment-input-common/payment-input-credit-card-receipt/payment-input-credit-card-receipt.component';
import {
  initPaymentInputCardSelectingData,
  PaymentInputCardSelectingData,
  CreditCardTypeCodeEnum,
} from '../payment-input-common/payment-input-card-selecting/payment-input-card-selecting.state';
import { PaymentInputSkyCoinBallancesComponent } from '../payment-input-common/payment-input-sky-coin-ballances/payment-input-sky-coin-ballances.component';
import { PaymentInputSkyCoinUsageComponent } from '../payment-input-common/payment-input-sky-coin-usage/payment-input-sky-coin-usage.component';
import { PaymentInputSkyCoinSummaryComponent } from '../payment-input-common/payment-input-sky-coin-summary/payment-input-sky-coin-summary.component';
import { MOffice } from '@lib/interfaces/m_office';
import { LocalDateService } from '@common/services';
import { PaymentInputCardInfoService } from '../payment-input-common/payment-input-card-info/payment-input-card-info.service';

/**
 * payment-input-credit-card
 * 支払方法；クレジットカード
 */
@Component({
  selector: 'asw-payment-input-credit-card',
  templateUrl: './payment-input-credit-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentInputCreditCardComponent extends SubComponentModelComponent<
  PaymentInputRequestCreditCardData,
  PaymentInputRequestCreditCardParts
> {
  constructor(
    public change: ChangeDetectorRef,
    public common: CommonLibService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _localDateService: LocalDateService,
    private _paymentInputCardInfoService: PaymentInputCardInfoService
  ) {
    super(change, common);
  }
  // SubComponentModelComponent用初期設定
  _data = initPaymentInputRequestCreditCardData();
  _parts = initPaymentInputRequestCreditCardParts();

  /**
   * SubComponentModelComponent用データ更新イベント
   */
  setDataEvent(): void {
    if (!this.data) {
      return;
    }
    this.skyCoinUsageData = this._data?.skyCoinUsageData;
    this.skyCoinBallancesData = this._data?.skyCoinBallancesData;
    this.skyCoinSummaryData = this._data?.skyCoinSummaryData;

    this.refresh();
  }
  setPartsEvent(): void {
    this.refresh();
  }

  @ViewChild(PaymentInputRequestCardInformationComponent)
  cardInfoComponent: PaymentInputRequestCardInformationComponent | undefined;
  @ViewChild(PaymentInputCardHolderInfoComponent)
  cardHolderInfoComponent: PaymentInputCardHolderInfoComponent | undefined;
  @ViewChild(PaymentInputCreditCardReceiptComponent)
  cardCardReceiptComponent: PaymentInputCreditCardReceiptComponent | undefined;

  // 画面に表示するクレジットカード名
  public creditCardName1?: string;
  public creditCardName2?: string;
  public creditCardName3?: string;

  public runValidation() {
    if (this.cardInfoComponent) this.cardInfoComponent.invokeValidation();
    if (this.cardHolderInfoComponent) this.cardHolderInfoComponent.invokeValidation();
    if (this.common.aswContextStoreService.aswContextData.posCountryCode === 'JP') {
      if (this.cardCardReceiptComponent) this.cardCardReceiptComponent.invokeValidation();
    }
    this.skyCoinUsageComponent?.invokeValidation();
  }

  @ViewChild(PaymentInputSkyCoinBallancesComponent)
  skyCoinBallancesComponent: PaymentInputSkyCoinBallancesComponent | undefined;
  @ViewChild(PaymentInputSkyCoinUsageComponent)
  skyCoinUsageComponent: PaymentInputSkyCoinUsageComponent | undefined;
  @ViewChild(PaymentInputSkyCoinSummaryComponent)
  SkyCoinSummaryComponent: PaymentInputSkyCoinSummaryComponent | undefined;
  public refresh() {
    this._data = {
      cardSelectingData: this._cardSelectingData,
      cardInformationData: this._cardInformationData,
      cardHolderInfoData: this._cardHolderInfoData,
      creditCardReceiptData: this._creditCardReceiptData,
      skyCoinBallancesData: this._skyCoinBallancesData,
      skyCoinUsageData: this._skyCoinUsageData,
      skyCoinSummaryData: this._skyCoinSummaryData,
    };
    this.change.detectChanges();
  }

  public update() {
    this._data = {
      cardSelectingData: this._cardSelectingData,
      cardInformationData: this._cardInformationData,
      cardHolderInfoData: this._cardHolderInfoData,
      creditCardReceiptData: this._creditCardReceiptData,
      skyCoinBallancesData: this._skyCoinBallancesData,
      skyCoinUsageData: this._skyCoinUsageData,
      skyCoinSummaryData: this._skyCoinSummaryData,
    };
    this.data.cardInformationData.selectedCard = this.data.cardSelectingData.selectedCard;
    this.cardInfoComponent?.cardNumberDisabled();
    this.dataChange.emit(this._data);
  }

  // クレジットカード情報データバインディング
  private _cardInformationData: PaymentInputRequestCardInformationData =
    initialPaymentInputRequestCardInformationData();
  set cardInformationData(value: PaymentInputRequestCardInformationData) {
    this._cardInformationData = value;
    this.update();
  }
  get cardInformationData(): PaymentInputRequestCardInformationData {
    return this._cardInformationData;
  }

  // クレジットカード名義人情報データバインディング
  private _cardHolderInfoData: PaymentInputCardHolderInfoData = initPaymentInputCardHolderInfoData();
  set cardHolderInfoData(value: PaymentInputCardHolderInfoData) {
    this._cardHolderInfoData = value;
    this.update();
  }
  get cardHolderInfoData(): PaymentInputCardHolderInfoData {
    return this._cardHolderInfoData;
  }

  // クレジットカード領収書名義情報データバインディング
  private _creditCardReceiptData: PaymentInputCreditCardReceiptData = initPaymentInputCreditCardReceiptData();
  set creditCardReceiptData(value: PaymentInputCreditCardReceiptData) {
    this._creditCardReceiptData = value;
    this.update();
  }
  get creditCardReceiptData(): PaymentInputCreditCardReceiptData {
    return this._creditCardReceiptData;
  }

  // skycoin残高情報データバインディング
  private _skyCoinBallancesData: PaymentInputRequestPaymentInputSkyCoinBallancesData =
    initPaymentInputSkyCoinBallancesData();
  set skyCoinBallancesData(value: PaymentInputRequestPaymentInputSkyCoinBallancesData) {
    this._skyCoinBallancesData = value;
    this.update();
  }
  get skyCoinBallancesData(): PaymentInputRequestPaymentInputSkyCoinBallancesData {
    return this._skyCoinBallancesData;
  }

  // skycoin使用情報データバインディング
  private _skyCoinUsageData: PaymentInputRequestPaymentInputSkyCoinUsageData = initPaymentInputSkyCoinUsageData();
  set skyCoinUsageData(value: PaymentInputRequestPaymentInputSkyCoinUsageData) {
    this._skyCoinUsageData = value;
    this.update();
  }
  get skyCoinUsageData(): PaymentInputRequestPaymentInputSkyCoinUsageData {
    return this._skyCoinUsageData;
  }

  // skycoin合計情報データバインディング
  private _skyCoinSummaryData: PaymentInputRequestPaymentInputSkyCoinSummaryData = initPaymentInputSkyCoinSummaryData();
  set skyCoinSummaryData(value: PaymentInputRequestPaymentInputSkyCoinSummaryData) {
    this._skyCoinSummaryData = value;
    this.update();
  }
  get skyCoinSummaryData(): PaymentInputRequestPaymentInputSkyCoinSummaryData {
    return this._skyCoinSummaryData;
  }

  // カード選択情報データバインディング
  private _cardSelectingData: PaymentInputCardSelectingData = initPaymentInputCardSelectingData();
  set cardSelectingData(value: PaymentInputCardSelectingData) {
    this._cardSelectingData = value;
    const expiryDate = value.creditCardInfo.cardExpiryDate;
    const creditCardInfo = {
      ...value.creditCardInfo,
      cardExpiryDate: expiryDate
        ? this._paymentInputCardInfoService.isExpired(expiryDate, this._localDateService.getCurrentDate())
          ? ''
          : expiryDate
        : '',
    };
    this._cardInformationData = {
      ...this._cardInformationData,
      ...creditCardInfo,
      selectedCard: value.selectedCard,
    };
    this.update();
  }
  get cardSelectingData(): PaymentInputCardSelectingData {
    return this._cardSelectingData;
  }

  // 使用するクレジットカード選択エリア表示判定
  public isDisplaySelectingCardArea: boolean = false;

  public totalUseCoinStatus: string = '';

  // 画面情報
  @Input() screenEntry: PaymentInputScreenEntryInfo = screenEntryData();
  // PNR情報
  @Input() pnrInfo: GetOrderResponseData | undefined = {};
  // クレジットカード用
  @Input() phoneCountryInfoList: Array<CountryCodeNameType> = [];
  @Input() currentOfficeInfo: MOffice = PaymentInputInitMOffice();
  @Input() phoneCode: string = '';
  @Input()
  set cardHolderInfo(data: PaymentInputCardHolderInfo) {
    this._cardHolderInfo = data;
    this._changeDetectorRef.markForCheck();
  }
  get cardHolderInfo(): PaymentInputCardHolderInfo {
    return this._cardHolderInfo;
  }
  private _cardHolderInfo: PaymentInputCardHolderInfo = {};

  @Output() updateAnaSkyCoinBalanceEvent = new EventEmitter<Event>();
  @Output() skyCoinToggleEvent = new EventEmitter<Event>();
  @Output() countryChangeEventPres = new EventEmitter<string>();

  // ANA Skyコイン用
  @Input() isKeepMyFare: boolean = false;
  @Input() paymentMethod: Map<String, boolean> = new Map();
  @Input() isAnaSkyCoinCombination: boolean = false;
  @Input() usageCoinFormControlList: Array<FormControl> = [];
  @Input() anaSkyCoinInfo: Array<AnaSkyCoinInfo> = [];
  @Input() totalUseCoin: number = 0;
  @Input() isCreditCardCombination: boolean = false;
  @Input() phoneCountryList: Array<CountryCodeNameType> = [];

  // 画面のサイズを切り替えの設定
  private _isSp = isSP();
  private _isTb = isTB();
  private _isPc = isPC();
  private _isSpPre = isSP();
  private _isTbPre = isTB();
  private _isPcPre = isPC();

  reload(): void {}

  //画面のサイズを切り替えの設定
  private resizeEvent = () => {
    this._isSpPre = this._isSp;
    this._isTbPre = this._isTb;
    this._isPcPre = this._isPc;
    this._isSp = isSP();
    this._isTb = isTB();
    this._isPc = isPC();
    if (this._isSpPre !== this._isSp || this._isTbPre !== this._isTb || this._isPcPre !== this._isPc) {
      this._changeDetectorRef.markForCheck();
    }
  };
  init(): void {
    this.subscribeService(
      'paymentInputCreditCard_subHeaderResize',
      fromEvent(window, 'resize').pipe(throttleTime(500)),
      this.resizeEvent
    );
    if (!this.common.isNotLogin()) {
      this.subscribeService(
        'paymentInputCreditCard_getMemberInformation',
        this.common.amcMemberStoreService.saveMemberInformationToAMCMember$(),
        (value) => {
          const programDynamicAttribute = value?.model?.data?.programDetails?.[0];
          programDynamicAttribute?.programDynamicAttribute?.forEach((attr) => {
            if (attr.attributeCode === CreditCardTypeCodeEnum.CreditCard1) {
              this.creditCardName1 = attr.attributeValue;
            } else if (attr.attributeCode === CreditCardTypeCodeEnum.CreditCard2) {
              this.creditCardName2 = attr.attributeValue;
            } else if (attr.attributeCode === CreditCardTypeCodeEnum.CreditCard3) {
              this.creditCardName3 = attr.attributeValue;
            }
          });

          this.isDisplaySelectingCardArea = !!(this.creditCardName1 || this.creditCardName2 || this.creditCardName3);
        }
      );
    }
  }
  destroy(): void {
    this.deleteSubscription('paymentInputCreditCard_getMemberInformation');
  }

  /** ANA Skyコイン用 */
  updateAnaSkyCoinBalance() {
    this.updateAnaSkyCoinBalanceEvent.emit();
  }

  skyCoinToggle() {
    this.skyCoinToggleEvent.emit();
  }

  /**
   * 画面情報表示処理用
   */
  resetPartsEvent(): void {
    // クレジットカード
    this.cardInfoComponent?.resetPartsEvent();
    this.cardHolderInfoComponent?.resetPartsEvent();
    this.cardCardReceiptComponent?.resetPartsEvent();
    this._changeDetectorRef.markForCheck();
  }

  /**
   * ANA SKYコイン　利用額更新イベント（支払内訳を更新）
   */
  public updateAnaSkyCoinSummary() {
    const skyCoinUsageTotal = this.data.skyCoinUsageData.usageCoin.reduce(function (sum, element) {
      return sum + Number(element.usageCoin ?? 0);
    }, 0);
    this.skyCoinSummaryData.totalUseCoin = skyCoinUsageTotal;
    this.SkyCoinSummaryComponent?.setDataEvent();
  }

  /**
   * ANA SKY コイン利用額入力欄のバリデーション状態を検出する
   * @param status INVALID: バリデーションエラー, VALID: 左記以外
   */
  public totalUseCoinStatusChange(status: FormControlStatus): void {
    status === 'INVALID' ? (this.totalUseCoinStatus = 'INVALID') : (this.totalUseCoinStatus = 'VALID');
  }
}
