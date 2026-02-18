import { ChangeDetectionStrategy, Component, EventEmitter, Output, ChangeDetectorRef } from '@angular/core';
import { CommonLibService, AswMasterService } from '@lib/services';
import { SubComponentModelComponent } from '@common/components/feature-parts/sub-conponent-model/sub-component-model.component';
import { isSP, isTB, isPC } from '@lib/helpers/common/common.helper';
import { fromEvent } from 'rxjs';
import { throttleTime } from 'rxjs/operators';
import {
  PaymentInputRequestPaymentInputSkyCoinBallancesData,
  PaymentInputRequestPaymentInputSkyCoinBallancesParts,
  initPaymentInputSkyCoinBallancesData,
  initPaymentInputSkyCoinBallancesParts,
} from './payment-input-sky-coin-ballances.state';
/**
 * payment-input-sky-coin-ballances
 * 支払方法；ANA SKYコイン(ANA SKYコイン残高情報)
 */
@Component({
  selector: 'asw-payment-input-sky-coin-ballances',
  templateUrl: './payment-input-sky-coin-ballances.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentInputSkyCoinBallancesComponent extends SubComponentModelComponent<
  PaymentInputRequestPaymentInputSkyCoinBallancesData,
  PaymentInputRequestPaymentInputSkyCoinBallancesParts
> {
  // SubComponentModelComponent用初期設定
  _data = initPaymentInputSkyCoinBallancesData();
  _parts = initPaymentInputSkyCoinBallancesParts();
  setDataEvent(): void {
    this.refresh();
  }
  setPartsEvent(): void {
    this.skyCoinBalance = this.parts.skyCoinBalance;
    this.mileBalance = this.parts.mileBalance;
    this.refresh();
  }
  public refresh() {
    this._changeDetectorRef.markForCheck();
  }
  public update() {
    this.dataChange.emit(this._data);
  }

  public paymentInputSkyCoinBallancesLink: string = '';

  reload(): void {}

  @Output()
  updateAnaSkyCoinBalanceEvent = new EventEmitter<Event>();

  //画面のサイズを切り替えの設定
  public isSp = isSP();
  public isTb = isTB();
  public isPc = isPC();
  private _isSpPre = isSP();
  private _isTbPre = isTB();
  private _isPcPre = isPC();

  /**
   * 画面のサイズを切り替えの設定
   */
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
    this.paymentInputSkyCoinBallancesLink =
      this.common.aswContextStoreService.aswContextData.lang === 'ja'
        ? this.aswMasterService.getMPropertyByKey('paymentInformationInput', 'exchangeMileageToSkyCoin')
        : this.aswMasterService.getMPropertyByKey('paymentInformationInput', 'exchangeMileageToSkyCoin.notJapanese');
    //画面のサイズを切り替えの設定
    this.subscribeService(
      'paymentInputPres_subHeaderResize',
      fromEvent(window, 'resize').pipe(throttleTime(500)),
      this.resizeEvent
    );
  }
  destroy(): void {}
  constructor(
    public common: CommonLibService,
    public aswMasterService: AswMasterService,
    private _changeDetectorRef: ChangeDetectorRef
  ) {
    super(_changeDetectorRef, common);
  }

  public skyCoinBalance: number = 0;
  public mileBalance: number = 0;

  updateAnaSkyCoinBalance() {
    this.updateAnaSkyCoinBalanceEvent.emit();
  }

  /**
   * 画面情報表示処理用
   */
  resetPartsEvent(): void {
    this.setPartsEvent();
  }

  /** マイルをANA SKY コインへ交換リンク押下時処理 */
  onClickReplaceMileageAndSkyCoin(event: Event) {
    event.preventDefault();
    window.open(this.paymentInputSkyCoinBallancesLink);
  }
}
