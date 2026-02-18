import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { isPC, isSP, isTB } from '@lib/helpers';
import { AswContextType, LoginStatusType } from '@lib/interfaces';
import { CommonLibService } from '@lib/services';
import { fromEvent, throttleTime } from 'rxjs';
import { passwordInputPayloadParts } from '@common/components/reservation/id-modal/password-input/password-input-payload.state';
import { ModalService } from '@lib/services/modal/modal.service';
import { PaymentInputCardInfo } from '../../../container/payment-input-cont.state';
import { SubComponentModelComponent } from '@common/components/feature-parts/sub-conponent-model/sub-component-model.component';
import {
  PaymentInputCardSelectingData,
  PaymentInputCardSelectingParts,
  initPaymentInputCardSelectingData,
  initPaymentInputCardSelectingParts,
  RegisteredCardTypeEnum,
  CreditCardTypeCodeEnum,
} from './payment-input-card-selecting.state';
import { GetCreditPanInformationStoreService } from '@common/services';
import { GetCreditPanInformationState } from '@common/store';
import { apiEventAll } from '@common/helper';
import { GetCreditPanInformationResponseData } from 'src/sdk-credit';

/**
 * payment-input-card-selecting
 * 支払方法；クレジットカード(使用するクレジットカード選択)
 */
@Component({
  selector: 'asw-payment-input-card-selecting',
  styleUrls: ['./payment-input-card-selecting.component.scss'],
  templateUrl: './payment-input-card-selecting.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentInputCardSelectingComponent extends SubComponentModelComponent<
  PaymentInputCardSelectingData,
  PaymentInputCardSelectingParts
> {
  // SubComponentModelComponent用初期設定
  _data = initPaymentInputCardSelectingData();
  _parts = initPaymentInputCardSelectingParts();
  setDataEvent(): void {
    this.refresh();
  }
  setPartsEvent(): void {
    this.selectedPaymentMethod = this.parts.selectedPaymentMethod;
    this.refresh();
  }

  // 選択支払方法
  public selectedPaymentMethod: string = '';
  // ログイン状態
  public isLogin: boolean = false;
  // パスワード入力済みかどうか
  public isPasswordAuthenticationPerformed: boolean = false;
  // クレジットカード情報
  public creditCardInfo: PaymentInputCardInfo = {};
  // SP版カード変更モード
  public cardChangeMode: boolean = true;
  // 選択されたクレジットカード
  public selectedCard: RegisteredCardTypeEnum = RegisteredCardTypeEnum.NewCard;
  // 画面に表示するクレジットカード名
  public creditCardName1?: string;
  public creditCardName2?: string;
  public creditCardName3?: string;

  public creditPanInfo?: GetCreditPanInformationResponseData | undefined;

  /**
   * パスワード認証後処理
   * @param value ボタンに紐づく文字列
   */
  passwordinputPostProcessing(value: RegisteredCardTypeEnum) {
    let creditValidYear: string;
    let creditValidMonth: string;
    if (value === RegisteredCardTypeEnum.PaymentCard1) {
      creditValidYear = String(this.creditPanInfo?.expirationYear1!);
      creditValidMonth = String(this.creditPanInfo?.expirationMonth1!).padStart(2, '0');
      this.selectedCard = value;
      this.creditCardInfo = {
        uatpCard: false,
        cardNumber: this.creditPanInfo?.creditNumberMask1,
        cardExpiryDate: creditValidYear + creditValidMonth,
        cvv: '',
        ownerName: '',
        reservation: false,
      };
      this._changeDetectorRef.markForCheck();
      // パスワード認証実施済みにする
      this.isPasswordAuthenticationPerformed = true;
    }
    if (value === RegisteredCardTypeEnum.PaymentCard2) {
      creditValidYear = String(this.creditPanInfo?.expirationYear2!);
      creditValidMonth = String(this.creditPanInfo?.expirationMonth2!).padStart(2, '0');
      this.selectedCard = value;
      this.creditCardInfo = {
        uatpCard: false,
        cardNumber: this.creditPanInfo?.creditNumberMask2,
        cardExpiryDate: creditValidYear + creditValidMonth,
        cvv: '',
        ownerName: '',
        reservation: false,
      };
      this._changeDetectorRef.markForCheck();
      // パスワード認証実施済みにする
      this.isPasswordAuthenticationPerformed = true;
    }
    if (value === RegisteredCardTypeEnum.PaymentCard3) {
      creditValidYear = String(this.creditPanInfo?.expirationYear3!);
      creditValidMonth = String(this.creditPanInfo?.expirationMonth3!).padStart(2, '0');
      this.selectedCard = value;
      this.creditCardInfo = {
        uatpCard: false,
        cardNumber: this.creditPanInfo?.creditNumberMask3,
        cardExpiryDate: creditValidYear + creditValidMonth,
        cvv: '',
        ownerName: '',
        reservation: false,
      };
      this._changeDetectorRef.markForCheck();
      // パスワード認証実施済みにする
      this.isPasswordAuthenticationPerformed = true;
    }
    this.update();
  }

  /**
   * 登録済みカードボタン押下後処理
   * @param value ボタンに紐づく文字列
   */
  handlePaymentCard(value: RegisteredCardTypeEnum) {
    if (!this.isPasswordAuthenticationPerformed) {
      // モーダル呼び出しパラメータの設定
      const part = passwordInputPayloadParts();
      // モーダルを閉じた後の処理を設定
      part.closeEvent = (response: GetCreditPanInformationResponseData) => {
        if (response) {
          this.creditPanInfo = response;
          this.passwordinputPostProcessing(value);
        }
      };
      // モーダル表示
      this._modalService.showSubPageModal(part);
    } else {
      this.passwordinputPostProcessing(value);
    }
  }

  /**
   * カードボタンのクリックイベント
   * @param value ボタンに紐づく文字列
   */
  selectedCreditCardChange(value: string) {
    // 端末種別がスマフォの場合カード選択の表示を更新
    if (this.isSp) {
      this.cardChangeMode = false;
    }
    if (value === RegisteredCardTypeEnum.NewCard) {
      this.handleNewCard();
    } else if (
      value === RegisteredCardTypeEnum.PaymentCard1 ||
      value === RegisteredCardTypeEnum.PaymentCard2 ||
      value === RegisteredCardTypeEnum.PaymentCard3
    ) {
      this.handlePaymentCard(value);
    }
  }

  /**
   * 新しいカードボタンのクリックイベント
   */
  handleNewCard() {
    this.selectedCard = RegisteredCardTypeEnum.NewCard;
    this.creditCardInfo = {
      uatpCard: false, // UATP
      cardNumber: '', // カード番号
      cardExpiryDate: '', // 有効期限
      cvv: '', // CVV
      ownerName: '', // 名義
      reservation: false, // 登録
    };
    this._changeDetectorRef.markForCheck();
    this.update();
  }

  /**
   * カード変更ボタン押下処理
   */
  changeSelectedCardSp() {
    //タブ機能表示
    if (this.isSp) {
      this.cardChangeMode = true;
    }
  }

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
    private _modalService: ModalService
  ) {
    super(_changeDetectorRef, _common);
  }

  public refresh() {
    this._changeDetectorRef.markForCheck();
  }
  public update() {
    this._data.creditCardInfo = this.creditCardInfo;
    this._data.selectedCard = this.selectedCard;
    this.dataChange.emit(this._data);
  }

  reload(): void {}

  //画面のサイズを切り替えの設定
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
  init(): void {
    this.subscribeService(
      'paymentInputCardSelecting_subHeaderResize',
      fromEvent(window, 'resize').pipe(throttleTime(500)),
      this.resizeEvent
    );

    this.subscribeService(
      'paymentInputCardSelecting_watch-login-status',
      this._common.aswContextStoreService.getAswContextByKey$(AswContextType.LOGIN_STATUS),
      (loginStatus: LoginStatusType) => {
        this.isLogin = loginStatus !== 'NOT_LOGIN';
      }
    );

    this.subscribeService(
      'paymentInputCardSelecting_memberInformation',
      this._common.amcMemberStoreService.saveMemberInformationToAMCMember$(),
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

        this.refresh();
      }
    );

    this.data.selectedCard = RegisteredCardTypeEnum.NewCard;
  }
  destroy(): void {
    this.deleteSubscription('paymentInputCardSelecting_subHeaderResize');
    this.deleteSubscription('paymentInputCardSelecting_watch-login-status');
    this.deleteSubscription('paymentInputCardSelecting_memberInformation');
  }
}
