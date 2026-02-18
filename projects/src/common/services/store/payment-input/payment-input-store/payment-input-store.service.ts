/**
 * 支払情報入力画面 store サービス
 */
import { Injectable } from '@angular/core';
import { SupportClass } from '@lib/components/support-class';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs/internal/Observable';
import { filter } from 'rxjs/operators';
import {
  paymentInputInitialState,
  PaymentInputState,
  PaymentInputStore,
  resetPaymentInput,
  selectPaymentInputState,
  setPaymentInput,
  updatePaymentInput,
} from '@common/store/payment-input';
import { GetAwardUsersStoreService } from '@lib/services';
import { GetOrderStoreService } from '@common/services/api-store/sdk-servicing/get-order-store/get-order-store.service';

/**
 * 支払情報入力画面 store サービス
 */
@Injectable()
export class PaymentInputStoreService extends SupportClass {
  /** 支払情報入力画面受け渡し情報Obeservable */
  private _paymentInput$: Observable<PaymentInputState>;
  /** Storeに格納する支払情報入力画面受け渡し情報State*/
  private _paymentInputData: PaymentInputState = paymentInputInitialState;
  /** 支払情報入力画面受け渡し情報の取得 */
  get paymentInputData() {
    return this._paymentInputData;
  }

  constructor(
    private _store: Store<PaymentInputStore>,
    private _getOrderStoreService: GetOrderStoreService,
    private _getAwardUsersService: GetAwardUsersStoreService
  ) {
    super();
    this._paymentInput$ = this._store.pipe(
      select(selectPaymentInputState),
      filter((data) => !!data)
    );
    this.subscribeService('PaymentInputStorService', this._paymentInput$, (data) => {
      this._paymentInputData = data;
    });
  }

  destroy() {}

  public getPaymentInput$() {
    return this._paymentInput$;
  }

  public resetPaymentInput() {
    this._store.dispatch(resetPaymentInput());
  }

  public setPaymentInput(value: PaymentInputState) {
    this._store.dispatch(setPaymentInput(value));
  }

  public setDefaultPaymentInput(value: PaymentInputState) {
    this._store.dispatch(setPaymentInput({ ...this.getReserveData(), ...value }));
  }

  public updatePaymentInput(value: Partial<PaymentInputState>) {
    this._store.dispatch(updatePaymentInput(value));
  }

  private getReserveData() {
    return Object.fromEntries(
      Object.entries(this._paymentInputData).filter(([key, value]) => value?.isReserveDeliveryData === true)
    );
  }

  /**
   * 支払情報入力画面取得情報破棄処理
   */
  public paymentInputInformationDiscard() {
    // PNR取得APIレスポンスの破棄
    this._getOrderStoreService.resetGetOrder();
  }

  /**
   * シートマップ系画面戻る時支払情報入力画面取得情報破棄処理
   */
  public paymentInputInformationDiscardBackSeatmap() {}
}
