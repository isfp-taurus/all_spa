/**
 * 操作中カート store サービス
 *
 */
import { Injectable } from '@angular/core';
import { SupportClass } from '@lib/components/support-class';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import {
  currentCartInitialState,
  CurrentCartModel,
  CurrentCartState,
  CurrentCartStore,
  resetCurrentCart,
  selectCurrentCartState,
  setCurrentCart,
  updateCurrentCart,
} from '@common/store/current-cart';
import { GetCartState } from '@common/store';

/**
 * 操作中カート store サービス
 *
 * store情報
 * @param CurrentCartData @see CurrentCartState
 */
@Injectable()
export class CurrentCartStoreService extends SupportClass {
  private _CurrentCart$: Observable<CurrentCartState>;
  private _CurrentCartData: CurrentCartState = currentCartInitialState;
  get CurrentCartData() {
    return this._CurrentCartData;
  }

  constructor(private _store: Store<CurrentCartStore>) {
    super();
    this._CurrentCart$ = this._store.pipe(
      select(selectCurrentCartState),
      filter((data) => !!data)
    );
    this.subscribeService('CurrentCartStoreService CurrentCartObservable', this._CurrentCart$, (data) => {
      this._CurrentCartData = data;
    });
  }

  destroy() {}

  public setCurrentCart(data: CurrentCartModel): void {
    this._store.dispatch(setCurrentCart(data));
  }

  public updateCurrentCart(plan: Partial<CurrentCartModel>): void {
    this._store.dispatch(updateCurrentCart(plan));
  }

  public getCurrentCart$() {
    return this._CurrentCart$;
  }

  public resetCurrentCart(): void {
    this._store.dispatch(resetCurrentCart());
  }
}
