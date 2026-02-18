/**
 * カート取得API store サービス
 *
 */
import { Injectable } from '@angular/core';
import { SupportClass } from '@lib/components/support-class';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs/internal/Observable';
import { filter } from 'rxjs/operators';
import { CreateCartRequest, CreateCartResponse, ReservationService } from 'src/sdk-reservation';
import { ApiErrorResponseService } from '@lib/services';
import {
  createCartInitialState,
  CreateCartState,
  CreateCartStore,
  resetCreateCart,
  selectCreateCartState,
  setCreateCart,
  setCreateCartFromApi,
} from '@common/store/create-cart';

/**
 * カート取得API store サービス
 *
 * store情報
 * @param CreateCartData @see CreateCartState
 */
@Injectable()
export class CreateCartStoreService extends SupportClass {
  private _CreateCart$: Observable<CreateCartState>;
  private _CreateCartData: CreateCartState = createCartInitialState;
  get CreateCartData() {
    return this._CreateCartData;
  }

  constructor(
    private _store: Store<CreateCartStore>,
    private _api: ReservationService,
    private _apiErrorResponseService: ApiErrorResponseService
  ) {
    super();
    this._CreateCart$ = this._store.pipe(
      select(selectCreateCartState),
      filter((data) => !!data)
    );
    this.subscribeService('CreateCartStoreService CreateCartObservable', this._CreateCart$, (data) => {
      this._CreateCartData = data;
    });
  }

  destroy() {}

  public getCreateCart$() {
    return this._CreateCart$;
  }

  public resetCreateCart() {
    this._store.dispatch(resetCreateCart());
  }

  public setCreateCartFromApi(request: CreateCartRequest) {
    this._store.dispatch(setCreateCartFromApi({ call: this._api.cartsCreateCartPost(request) }));
  }

  // テスト時にカート作成済みの状態を再現する用
  public setCreateCart(data: CreateCartResponse): void {
    this._store.dispatch(setCreateCart(data));
  }
}
