/**
 * カート取得API store サービス
 *
 */
import { Injectable } from '@angular/core';
import { SupportClass } from '@lib/components/support-class';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs/internal/Observable';
import { filter } from 'rxjs/operators';
import { PostGetCartRequest, ReservationService } from 'src/sdk-reservation';
import { ApiErrorResponseService } from '@lib/services';
import {
  getCartInitialState,
  GetCartState,
  GetCartStore,
  resetGetCart,
  selectGetCartState,
  setGetCartFromApi,
} from '@common/store/get-cart';

/**
 * カート取得API store サービス
 *
 * store情報
 * @param GetCartData @see GetCartState
 */
@Injectable()
export class GetCartStoreService extends SupportClass {
  private _GetCart$: Observable<GetCartState>;
  private _GetCartData: GetCartState = getCartInitialState;
  get GetCartData() {
    return this._GetCartData;
  }

  constructor(
    private _store: Store<GetCartStore>,
    private _api: ReservationService,
    private _apiErrorResponseService: ApiErrorResponseService
  ) {
    super();
    this._GetCart$ = this._store.pipe(
      select(selectGetCartState),
      filter((data) => !!data)
    );
    this.subscribeService('GetCartStoreService GetCartObservable', this._GetCart$, (data) => {
      this._GetCartData = data;
    });
  }

  destroy() {}

  public getGetCart$() {
    return this._GetCart$;
  }

  public resetGetCart() {
    this._store.dispatch(resetGetCart());
  }

  public setGetCartFromApi(request: PostGetCartRequest) {
    this._store.dispatch(setGetCartFromApi({ call: this._api.cartsGetCartPost(request) }));
  }
}
