/**
 * prebookAPI store サービス
 *
 */
import { Injectable } from '@angular/core';
import { SupportClass } from '@lib/components/support-class';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs/internal/Observable';
import { filter } from 'rxjs/operators';
import { ApiErrorResponseService } from '@lib/services/api-error-response/api-error-response.service';
import { ReservationService, OrdersCreateOrderRequest } from 'src/sdk-reservation';
import {
  createOrderInitialState,
  CreateOrderState,
  CreateOrderStore,
  resetCreateOrder,
  selectCreateOrderState,
  setCreateOrderFromApi,
} from '@common/store/create-order';

/**
 * prebookAPI store サービス
 *
 * store情報
 * @param createOrderData @see CreateOrderState
 */
@Injectable()
export class CreateOrderStoreService extends SupportClass {
  private _createOrder$: Observable<CreateOrderState>;
  private _createOrderData: CreateOrderState = createOrderInitialState;
  get createOrderData() {
    return this._createOrderData;
  }

  constructor(
    private _store: Store<CreateOrderStore>,
    private _api: ReservationService,
    private _apiErrorResponseService: ApiErrorResponseService
  ) {
    super();
    this._createOrder$ = this._store.pipe(
      select(selectCreateOrderState),
      filter((data) => !!data)
    );
    this.subscribeService('CreateOrderStoreService CreateOrderObservable', this._createOrder$, (data) => {
      this._createOrderData = data;
    });
  }

  destroy() {}

  public getCreateOrder$() {
    return this._createOrder$;
  }

  public resetCreateOrder() {
    this._store.dispatch(resetCreateOrder());
  }

  public setCreateOrderFromApi(request: OrdersCreateOrderRequest) {
    this._store.dispatch(setCreateOrderFromApi({ call: this._api.ordersCreateOrderPost(request) }));
  }
}
