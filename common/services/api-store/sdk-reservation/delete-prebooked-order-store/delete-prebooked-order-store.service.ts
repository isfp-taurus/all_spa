/**
 * カート取得API store サービス
 *
 */
import { Injectable } from '@angular/core';
import { SupportClass } from '@lib/components/support-class';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs/internal/Observable';
import { filter } from 'rxjs/operators';
import { OrdersDeletePrebookedOrderRequest, ReservationService } from 'src/sdk-reservation';
import { ApiErrorResponseService } from '@lib/services';
import {
  deletePrebookedOrderInitialState,
  DeletePrebookedOrderState,
  DeletePrebookedOrderStore,
  resetDeletePrebookedOrder,
  selectDeletePrebookedOrderState,
  setDeletePrebookedOrderFromApi,
} from '@common/store/delete-prebooked-order';

/**
 * カート取得API store サービス
 *
 * store情報
 * @param DeletePrebookedOrderData @see DeletePrebookedOrderState
 */
@Injectable()
export class DeletePrebookedOrderStoreService extends SupportClass {
  private _DeletePrebookedOrder$: Observable<DeletePrebookedOrderState>;
  private _DeletePrebookedOrderData: DeletePrebookedOrderState = deletePrebookedOrderInitialState;
  get DeletePrebookedOrderData() {
    return this._DeletePrebookedOrderData;
  }

  constructor(
    private _store: Store<DeletePrebookedOrderStore>,
    private _api: ReservationService,
    private _apiErrorResponseService: ApiErrorResponseService
  ) {
    super();
    this._DeletePrebookedOrder$ = this._store.pipe(
      select(selectDeletePrebookedOrderState),
      filter((data) => !!data)
    );
    this.subscribeService(
      'DeletePrebookedOrderStoreService DeletePrebookedOrderObservable',
      this._DeletePrebookedOrder$,
      (data) => {
        this._DeletePrebookedOrderData = data;
      }
    );
  }

  destroy() {}

  public getDeletePrebookedOrder$() {
    return this._DeletePrebookedOrder$;
  }

  public resetDeletePrebookedOrder() {
    this._store.dispatch(resetDeletePrebookedOrder());
  }

  public setDeletePrebookedOrderFromApi(request: OrdersDeletePrebookedOrderRequest) {
    this._store.dispatch(setDeletePrebookedOrderFromApi({ call: this._api.ordersDeletePrebookedOrderPost(request) }));
  }
}
