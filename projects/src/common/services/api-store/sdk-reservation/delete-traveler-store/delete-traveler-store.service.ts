/**
 * 搭乗者削除API store サービス
 *
 */
import { Injectable } from '@angular/core';
import { SupportClass } from '@lib/components/support-class';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs/internal/Observable';
import { filter } from 'rxjs/operators';
import { ApiErrorResponseService } from '@lib/services';
import { CartsDeleteTravelerRequest, ReservationService } from 'src/sdk-reservation';
import {
  deleteTravelerInitialState,
  DeleteTravelerState,
  DeleteTravelerStore,
  resetDeleteTraveler,
  selectDeleteTravelerState,
  setDeleteTravelerFromApi,
} from '@common/store/delete-traveler';

/**
 * プラン削除API store サービス
 *
 * store情報
 * @param DeleteTravelerData @see DeleteTravelerState
 */
@Injectable()
export class DeleteTravelerStoreService extends SupportClass {
  private _DeleteTraveler$: Observable<DeleteTravelerState>;
  private _DeleteTravelerData: DeleteTravelerState = deleteTravelerInitialState;
  get DeleteTravelerData() {
    return this._DeleteTravelerData;
  }

  constructor(
    private _store: Store<DeleteTravelerStore>,
    private _api: ReservationService,
    private _apiErrorResponseService: ApiErrorResponseService
  ) {
    super();
    this._DeleteTraveler$ = this._store.pipe(
      select(selectDeleteTravelerState),
      filter((data) => !!data)
    );
    this.subscribeService('DeleteTravelerStoreService DeleteTravelerObservable', this._DeleteTraveler$, (data) => {
      this._DeleteTravelerData = data;
    });
  }

  destroy() {}

  public getDeleteTraveler$() {
    return this._DeleteTraveler$;
  }

  public resetDeleteTraveler() {
    this._store.dispatch(resetDeleteTraveler());
  }

  public setDeleteTravelerFromApi(request: CartsDeleteTravelerRequest) {
    this._store.dispatch(setDeleteTravelerFromApi({ call: this._api.cartsDeleteTravelerPost(request) }));
  }
}
