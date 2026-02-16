import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { AnabizBasicCardInfo } from '@app/anabiz-payment-input/container/anabiz-payment-input-cont.state';
import { passwordInputPayloadParts } from '@common/components/reservation/id-modal/password-input';
import { apiEventAll } from '@common/helper';
import { SupportComponent } from '@lib/components/support-class';
import { isSP, isTB, isPC } from '@lib/helpers';
import { ApiCommonRequest, AswContextType, LoginStatusType } from '@lib/interfaces';
import { CommonLibService, ModalService } from '@lib/services';
import { fromEvent, throttleTime } from 'rxjs';
import { PaymentRequestPaymentCard } from 'src/sdk-reservation/model/models';

@Component({
  selector: 'asw-anabiz-payment-input-card-selecting',
  templateUrl: './anabiz-payment-input-card-selecting.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnabizPaymentInputCardSelectingComponent extends SupportComponent {
  // ログイン状態
  public isLogin: boolean = true;
  // パスワード入力済みかどうか
  public isPasswordAuthenticationPerformed: boolean = false;
  // クレジットカード情報
  public creditCardInfo: AnabizBasicCardInfo = {};
  // SP版カード変更モード
  public cardChangeMode: boolean = true;

  // 選択されたクレジットカード
  @Input() selectedCard: string = 'other';
  @Output() selectedCardChange: EventEmitter<string> = new EventEmitter<string>();

  // 画面に表示するクレジットカード名
  public creditCardName1?: string;
  public creditCardName2?: string;

  /** クレカ情報更新用 */
  @Output()
  updateSelectedCreditCard: EventEmitter<AnabizBasicCardInfo> = new EventEmitter<AnabizBasicCardInfo>();

  constructor(
    public _common: CommonLibService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _modalService: ModalService
  ) {
    super(_common);
  }

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

  reload(): void {}
  init(): void {
    if (isSP()) {
      this.cardChangeMode = false;
    }
    this.subscribeService(
      'anabizPaymentInputCardSelecting_subHeaderResize',
      fromEvent(window, 'resize').pipe(throttleTime(500)),
      this.resizeEvent
    );

    this.subscribeService(
      'anabizPaymentInputCardSelecting_watch-login-status',
      this._common.aswContextStoreService.getAswContextByKey$(AswContextType.LOGIN_STATUS),
      (loginStatus: LoginStatusType) => {
        this.isLogin = loginStatus === LoginStatusType.REAL_LOGIN;
      }
    );
  }
  destroy(): void {
    this.deleteSubscription('anabizPaymentInputCardSelecting_subHeaderResize');
    this.deleteSubscription('anabizPaymentInputCardSelecting_watch-login-status');
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
   * 新しいカードボタンのクリックイベント
   */
  handleNewCard() {
    this.selectedCard = 'other';
    this.creditCardInfo = {
      uatpCard: false, // UATP
      cardNumber: '', // カード番号
      cardExpiryDate: '', // 有効期限
      cvv: '', // CVV
      ownerName: '', // 名義
      reservation: false, // 登録
    };

    this.selectedCardChange.emit(this.selectedCard);
    this.updateSelectedCreditCard.emit(this.creditCardInfo);
    this._changeDetectorRef.markForCheck();
  }

  /**
   * 登録済みカードボタン押下後処理
   * @param cardType ボタンに紐づく文字列
   */
  handlePaymentCard(cardType: PaymentRequestPaymentCard.RegisteredCardTypeEnum) {
    if (!this.isPasswordAuthenticationPerformed) {
      // モーダル呼び出しパラメータの設定
      const part = passwordInputPayloadParts();
      // モーダルを閉じた後の処理を設定
      part.closeEvent = (value?: boolean) => {
        if (value) {
          this.passwordinputPostProcessing(cardType);
        }
      };
      // モーダル表示
      this._modalService.showSubPageModal(part);
    } else {
      this.passwordinputPostProcessing(cardType);
    }
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

  /**
   * カードボタンのクリックイベント
   * @param value ボタンに紐づく文字列
   */
  selectedCreditCardChange(value: string) {
    // 端末種別がスマフォの場合カード選択の表示を更新
    if (this.isSp) {
      this.cardChangeMode = false;
    }
    if (value === 'other') {
      this.handleNewCard();
    } else if (
      value === PaymentRequestPaymentCard.RegisteredCardTypeEnum.CorporatePaymentCard1 ||
      value === PaymentRequestPaymentCard.RegisteredCardTypeEnum.CorporatePaymentCard2
    ) {
      this.handlePaymentCard(value);
    }
  }

  /**
   * パスワード認証後処理
   * @param value ボタンに紐づく文字列
   */
  passwordinputPostProcessing(cardType: PaymentRequestPaymentCard.RegisteredCardTypeEnum) {
    this.selectedCard = cardType;
    this.creditCardInfo = {
      uatpCard: false,
      cardNumber: '',
      cardExpiryDate: '',
      cvv: '',
      ownerName: '',
      reservation: false,
    };
    // パスワード認証実施済みにする
    this.isPasswordAuthenticationPerformed = true;

    this.selectedCardChange.emit(this.selectedCard);
    this.updateSelectedCreditCard.emit(this.creditCardInfo);
    this._changeDetectorRef.markForCheck();
  }
}
