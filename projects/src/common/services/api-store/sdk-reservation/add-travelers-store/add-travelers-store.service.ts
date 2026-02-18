/**
 * カート取得API store サービス
 *
 */
import { Injectable } from '@angular/core';
import { SupportClass } from '@lib/components/support-class';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { ReservationService, CartsAddTravelersRequest } from 'src/sdk-reservation';
import { ApiErrorResponseService } from '@lib/services';
import {
  addTravelersInitialState,
  AddTravelersState,
  AddTravelersStore,
  resetAddTravelers,
  selectAddTravelersState,
  setAddTravelersFromApi,
} from '@common/store/add-travelers';

/**
 * カート取得API store サービス
 *
 * store情報
 * @param AddTravelersData @see AddTravelersState
 */
@Injectable()
export class AddTravelersStoreService extends SupportClass {
  private _AddTravelers$: Observable<AddTravelersState>;
  private _AddTravelersData: AddTravelersState = addTravelersInitialState;
  get AddTravelersData() {
    return this._AddTravelersData;
  }

  constructor(
    private _store: Store<AddTravelersStore>,
    private _api: ReservationService,
    private _apiErrorResponseService: ApiErrorResponseService
  ) {
    super();
    this._AddTravelers$ = this._store.pipe(
      select(selectAddTravelersState),
      filter((data) => !!data)
    );
    this.subscribeService('AddTravelersStoreService AddTravelersObservable', this._AddTravelers$, (data) => {
      this._AddTravelersData = data;
    });
  }

  destroy() {}

  public getAddTravelers$() {
    return this._AddTravelers$;
  }

  public resetAddTravelers() {
    this._store.dispatch(resetAddTravelers());
  }

  public setAddTravelersFromApi(request: CartsAddTravelersRequest) {
    this._store.dispatch(setAddTravelersFromApi({ call: this._api.cartsAddTravelersPost(request) }));
  }
}
