import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { SupportComponent } from '@lib/components/support-class';
import { CommonLibService } from '@lib/services';

@Component({
  selector: 'asw-anabiz-payment-input-payment-methods',
  templateUrl: './anabiz-payment-input-payment-methods.component.html',
  styleUrls: ['./anabiz-payment-input-payment-methods.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnabizPaymentInputPaymentMethodsComponent extends SupportComponent {
  // 端末種別(SP)
  @Input() isSp: boolean = false;
  //　出張者識別子
  @Input() isTraveler: boolean = false;

  @Input() isReserveOnly: boolean = false;

  @Input() isWaitlisted: boolean = false;

  // 予約のみが選択可能識別子
  @Input() isOnholdEligible: boolean = false;

  // カードレス判定
  @Input() isCardless: boolean = false;

  @Input() hasCartId: boolean = false;

  @Input() isCreditCardPayment: boolean = false;

  public selectedPaymentMethod: string = 'CD';

  constructor(private _common: CommonLibService, private _changeDetectorRef: ChangeDetectorRef) {
    super(_common);
  }

  /** 支払い方法更新Output */
  @Output()
  updatePaymentMethod: EventEmitter<boolean> = new EventEmitter<boolean>();

  reload(): void {}
  init(): void {}
  destroy(): void {}

  //ラジオボタン押下時処理
  setCreditCard(isCreditCardPayment: boolean) {
    this.updatePaymentMethod.emit(isCreditCardPayment);
    this._changeDetectorRef.markForCheck();
  }
}
