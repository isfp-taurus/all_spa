/**
 * 予約情報取得API store サービス
 *
 */
import { Injectable } from '@angular/core';
import { SupportClass } from '@lib/components/support-class';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs/internal/Observable';
import { filter } from 'rxjs/operators';
import {} from '@lib/store';
import { ServicingApiService, GetOrderRequest, GetOrderResponse } from 'src/sdk-servicing';
import {
  GetOrderState,
  GetOrderStore,
  resetGetOrder,
  selectGetOrderState,
  setGetOrderFromApi,
} from '@common/store/get-order';
import { ApiErrorResponseService } from '@lib/services/api-error-response/api-error-response.service';

/**
 * 予約情報取得API store サービス
 *
 * store情報
 * @param getOrderData @see GetOrderState
 */
@Injectable()
export class GetOrderStoreService extends SupportClass {
  private _getOrder$: Observable<GetOrderState>;
  private _getOrderData!: GetOrderState;
  get getOrderData() {
    return this._getOrderData;
  }

  constructor(
    private store: Store<GetOrderStore>,
    private api: ServicingApiService,
    private _apiErrorResponseService: ApiErrorResponseService
  ) {
    super();
    this._getOrder$ = this.store.pipe(
      select(selectGetOrderState),
      filter((data) => !!data)
    );
    this.subscribeService('GetOrderStoreService', this._getOrder$, (data) => {
      this._getOrderData = data;
    });
  }

  destroy() {}

  public getGetOrderObservable() {
    return this._getOrder$;
  }

  public resetGetOrder() {
    this.store.dispatch(resetGetOrder());
  }

  public setGetOrderFromApi(request: GetOrderRequest) {
    this.store.dispatch(setGetOrderFromApi({ call: this.api.ordersGetOrderPost(request) }));
  }
}
