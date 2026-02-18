/**
 * 購入発券API store サービス
 *
 */
import { Injectable } from '@angular/core';
import { SupportClass } from '@lib/components/support-class';
import { select, Store } from '@ngrx/store';
import { filter, Observable } from 'rxjs';
import {} from '@lib/store';
import { ReservationService, OrdersPaymentRecordsRequest } from 'src/sdk-reservation';
import {
  OrdersPaymentRecordsState,
  OrdersPaymentRecordsStore,
  resetOrdersPaymentRecords,
  selectOrdersPaymentRecordsState,
  setOrdersPaymentRecordsFromApi,
} from '@common/store/orders-payment-records';
import { ApiErrorResponseService } from '@lib/services/api-error-response/api-error-response.service';

/**
 * 購入発券API store サービス
 *
 * store情報
 * @param ordersPaymentRecordsData @see OrdersPaymentRecordsState
 */
@Injectable()
export class OrdersPaymentRecordsStoreService extends SupportClass {
  private _ordersPaymentRecords$: Observable<OrdersPaymentRecordsState>;
  private _ordersPaymentRecordsData!: OrdersPaymentRecordsState;
  get ordersPaymentRecordsData() {
    return this._ordersPaymentRecordsData;
  }

  constructor(
    private store: Store<OrdersPaymentRecordsStore>,
    private api: ReservationService,
    private _apiErrorResponseService: ApiErrorResponseService
  ) {
    super();
    this._ordersPaymentRecords$ = this.store.pipe(
      select(selectOrdersPaymentRecordsState),
      filter((data) => !!data)
    );
    this.subscribeService('ordersPaymentRecords', this._ordersPaymentRecords$, (data) => {
      this._ordersPaymentRecordsData = data;
    });
  }

  destroy() {}

  public getOrdersPaymentRecords$() {
    return this._ordersPaymentRecords$;
  }

  public resetOrdersPaymentRecords() {
    this.store.dispatch(resetOrdersPaymentRecords());
  }

  public setOrdersPaymentRecordsFromApi(request: OrdersPaymentRecordsRequest) {
    this.store.dispatch(setOrdersPaymentRecordsFromApi({ call: this.api.ordersPaymentRecordsPost(request) }));
  }
}
