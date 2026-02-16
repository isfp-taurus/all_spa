/**
 * 購入時運賃再計算API store サービス
 *
 */
import { Injectable } from '@angular/core';
import { SupportClass } from '@lib/components/support-class';
import { select, Store } from '@ngrx/store';
import { filter, Observable } from 'rxjs';
import {} from '@lib/store';
import { ReservationService, OrdersRepriceOrderRequest } from 'src/sdk-reservation';
import {
  OrdersRepriceOrderState,
  OrdersRepriceOrderStore,
  resetOrdersRepriceOrder,
  selectOrdersRepriceOrderState,
  setOrdersRepriceOrderFromApi,
} from '@common/store/orders-reprice-order';
import { ApiErrorResponseService } from '@lib/services/api-error-response/api-error-response.service';

/**
 * 購入時運賃再計算API store サービス
 *
 * store情報
 * @param ordersRepriceOrderData @see OrdersRepriceOrderState
 */
@Injectable()
export class OrdersRepriceOrderStoreService extends SupportClass {
  private _ordersRepriceOrder$: Observable<OrdersRepriceOrderState>;
  private _ordersRepriceOrderData!: OrdersRepriceOrderState;
  get ordersRepriceOrderData() {
    return this._ordersRepriceOrderData;
  }

  constructor(
    private store: Store<OrdersRepriceOrderStore>,
    private api: ReservationService,
    private _apiErrorResponseService: ApiErrorResponseService
  ) {
    super();
    this._ordersRepriceOrder$ = this.store.pipe(
      select(selectOrdersRepriceOrderState),
      filter((data) => !!data)
    );
    this.subscribeService('ordersRepriceOrder', this._ordersRepriceOrder$, (data) => {
      this._ordersRepriceOrderData = data;
    });
  }

  destroy() {}

  public getOrdersRepriceOrder$() {
    return this._ordersRepriceOrder$;
  }

  public resetOrdersRepriceOrder() {
    this.store.dispatch(resetOrdersRepriceOrder());
  }

  public setOrdersRepriceOrderFromApi(request: OrdersRepriceOrderRequest) {
    this.store.dispatch(setOrdersRepriceOrderFromApi({ call: this.api.ordersRepriceOrderPost(request) }));
  }
}
