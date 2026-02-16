import { ChangeDetectorRef, ViewChild } from '@angular/core';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormControlStatus } from '@angular/forms';
import {
  AnaSkyCoinInfo,
  PaymentInputCardHolderInfo,
  PaymentInputCardInfo,
  PaymentInputScreenEntryInfo,
  PaymentInputInitMOffice,
} from '@app/payment-input/container/payment-input-cont.state';
import { CountryCodeNameType } from '@common/interfaces';
import { CommonLibService } from '@lib/services';
import { GetOrderResponseData } from 'src/sdk-servicing';
import { SubComponentModelComponent } from '@common/components/feature-parts/sub-conponent-model/sub-component-model.component';
import {
  PaymentInputSkyCoinData,
  PaymentInputSkyCoinParts,
  initPaymentInputSkyCoinData,
  initPaymentInputSkyCoinParts,
} from './payment-input-sky-coin.state';
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
  PaymentInputCardHolderInfoData,
  initPaymentInputCardHolderInfoData,
} from '../payment-input-common/payment-input-card-holder-info/payment-input-card-holder-info.state';
import {
  PaymentInputRequestCardInformationData,
  initialPaymentInputRequestCardInformationData,
} from '../payment-input-common/payment-input-card-info/payment-input-card-info.state';
import { PaymentInputRequestCardInformationComponent } from '../payment-input-common/payment-input-card-info/payment-input-card-info.component';
import { PaymentInputCardHolderInfoComponent } from '../payment-input-common/payment-input-card-holder-info/payment-input-card-holder-info.component';
import { PaymentInputCreditCardReceiptComponent } from '../payment-input-common/payment-input-credit-card-receipt/payment-input-credit-card-receipt.component';
import {
  PaymentInputCardSelectingData,
  initPaymentInputCardSelectingData,
} from '../payment-input-common/payment-input-card-selecting/payment-input-card-selecting.state';
import {
  PaymentInputCreditCardReceiptData,
  initPaymentInputCreditCardReceiptData,
} from '../payment-input-common/payment-input-credit-card-receipt/payment-input-credit-card-receipt.state';
import { PaymentInputSkyCoinBallancesComponent } from '../payment-input-common/payment-input-sky-coin-ballances/payment-input-sky-coin-ballances.component';
import { PaymentInputSkyCoinUsageComponent } from '../payment-input-common/payment-input-sky-coin-usage/payment-input-sky-coin-usage.component';
import { PaymentInputSkyCoinSummaryComponent } from '../payment-input-common/payment-input-sky-coin-summary/payment-input-sky-coin-summary.component';
import { MOffice } from '@lib/interfaces';
import { screenEntryData } from '../../container/payment-input-cont.state';
import { PaymentMethodsType } from '@common/interfaces/common/payment-methods';
/**
 * payment-input-sky-coin
 * 支払方法；ANA SKYコイン
 */
@Component({
  selector: 'asw-payment-input-sky-coin',
  templateUrl: './payment-input-sky-coin.component.html',
  styleUrls: ['./payment-input-sky-coin.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentInputSkyCoinComponent extends SubComponentModelComponent<
  PaymentInputSkyCoinData,
  PaymentInputSkyCoinParts
> {
  // SubComponentModelComponent用初期設定
  _data = initPaymentInputSkyCoinData();
  _parts = initPaymentInputSkyCoinParts();

  /**
   * SubComponentModelComponent用データ更新イベント
   */
  setDataEvent(): void {
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

  public runValidation() {
    this.cardInfoComponent?.invokeValidation(PaymentMethodsType.ANA_SKY_COIN);
    this.cardHolderInfoComponent?.invokeValidation();
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
    this._changeDetectorRef.markForCheck();
  }
  public update() {
    this.updateAnaSkyCoinSummary();

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

  // クレジットカード名義人情報データバインディング
  private _cardHolderInfoData: PaymentInputCardHolderInfoData = initPaymentInputCardHolderInfoData();
  set cardHolderInfoData(value: PaymentInputCardHolderInfoData) {
    this._cardHolderInfoData = value;
    this.update();
  }
  get cardHolderInfoData(): PaymentInputCardHolderInfoData {
    return this._cardHolderInfoData;
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

  // カード選択情報データバインディング
  private _cardSelectingData: PaymentInputCardSelectingData = initPaymentInputCardSelectingData();
  set cardSelectingData(value: PaymentInputCardSelectingData) {
    this._cardSelectingData = value;
    this._cardInformationData = {
      ...this._cardInformationData,
      ...this._cardSelectingData.creditCardInfo,
      selectedCard: this._cardSelectingData.selectedCard,
    };
    this.update();
  }
  get cardSelectingData(): PaymentInputCardSelectingData {
    return this._cardSelectingData;
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

  // 使用するクレジットカード選択エリア表示判定
  public isDisplaySelectingCardArea: boolean = false;

  public totalUseCoinStatus: string = '';

  // 画面情報
  @Input() screenEntry: PaymentInputScreenEntryInfo = screenEntryData();
  // PNR情報
  @Input() pnrInfo: GetOrderResponseData | undefined = {};
  @Input() usageCoinFormControlList: Array<FormControl> = [];
  @Input() isAnaSkyCoinCombination: boolean | undefined;
  @Input() anaSkyCoinInfo: Array<AnaSkyCoinInfo> = [];
  @Input() totalUseCoin: number = 0;
  @Input() phoneCountryList: Array<CountryCodeNameType> = [];
  @Input() isCreditCardCombination!: boolean;
  @Input() phoneCountryInfoList: Array<CountryCodeNameType> = [];
  @Input() phoneCode: string | undefined;
  @Input() isKeepMyFare: boolean | undefined;
  @Input() paymentMethod: Map<String, boolean> = new Map();
  @Input() currentOfficeInfo: MOffice = PaymentInputInitMOffice();
  @Input()
  set creditCardInfo(data: PaymentInputCardInfo) {
    this._creditCardInfo = data;
    this._changeDetectorRef.markForCheck();
  }
  get creditCardInfo(): PaymentInputCardInfo {
    return this._creditCardInfo;
  }
  private _creditCardInfo: PaymentInputCardInfo = {};
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
  @Output() creditCardToggleEvent = new EventEmitter<Event>();

  reload(): void {}
  init(): void {}
  destroy(): void {
    this.deleteSubscription('paymentInputCreditCard_basicReservationInformation');
  }
  constructor(public common: CommonLibService, private _changeDetectorRef: ChangeDetectorRef) {
    super(_changeDetectorRef, common);
  }

  /**
   * 画面情報表示処理用
   */
  resetPartsEvent() {
    // SKYコイン
    this.skyCoinBallancesComponent?.resetPartsEvent();
    this.skyCoinUsageComponent?.resetPartsEvent();
    this.SkyCoinSummaryComponent?.resetPartsEvent();
    // クレジットカード
    if (
      this.cardInfoComponent !== undefined &&
      this.cardHolderInfoComponent !== undefined &&
      this.cardCardReceiptComponent !== undefined
    ) {
      this.cardInfoComponent?.resetPartsEvent();
      this.cardHolderInfoComponent?.resetPartsEvent();
      this.cardCardReceiptComponent?.resetPartsEvent();
    }
    this.refresh();
  }

  updateData(newData: string) {
    this.screenEntry.selectedPaymentMethod = newData;
    this._changeDetectorRef.markForCheck();
  }
  updateAnaSkyCoinBalance() {
    this.updateAnaSkyCoinBalanceEvent.emit();
  }

  creditCardToggle() {
    this.creditCardToggleEvent.emit();
  }

  /**
   * ANA SKYコイン　利用額更新イベント（支払内訳を更新）
   */
  public updateAnaSkyCoinSummary() {
    const skyCoinUsageTotal = this.skyCoinUsageData.usageCoin.reduce(function (sum, element) {
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
