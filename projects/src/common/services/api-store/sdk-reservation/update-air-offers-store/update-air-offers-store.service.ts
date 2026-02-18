/**
 * AirOffer更新API store サービス
 *
 */
import { Injectable } from '@angular/core';
import { SupportClass } from '@lib/components/support-class';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs/internal/Observable';
import { filter } from 'rxjs/operators';
import { ApiErrorResponseService } from '@lib/services';
import { PatchUpdateAirOffersRequest, ReservationService } from 'src/sdk-reservation';
import {
  UpdateAirOffersState,
  UpdateAirOffersStore,
  resetUpdateAirOffers,
  selectUpdateAirOffersState,
  setUpdateAirOffersFromApi,
} from '@common/store/update-air-offers';

/**
 * AirOffer更新API store サービス
 *
 * store情報
 * @param UpdateAirOffersData @see UpdateAirOffersState
 */
@Injectable()
export class UpdateAirOffersStoreService extends SupportClass {
  private _UpdateAirOffers$: Observable<UpdateAirOffersState>;
  private _UpdateAirOffersData!: UpdateAirOffersState;
  get UpdateAirOffersData() {
    return this._UpdateAirOffersData;
  }

  constructor(
    private _store: Store<UpdateAirOffersStore>,
    private _api: ReservationService,
    private _apiErrorResponseService: ApiErrorResponseService
  ) {
    super();
    this._UpdateAirOffers$ = this._store.pipe(
      select(selectUpdateAirOffersState),
      filter((data) => !!data)
    );
    this.subscribeService('UpdateAirOffersStoreService UpdateAirOffersObservable', this._UpdateAirOffers$, (data) => {
      this._UpdateAirOffersData = data;
    });
  }

  destroy() {}

  public getUpdateAirOffers$() {
    return this._UpdateAirOffers$;
  }

  public resetUpdateAirOffers() {
    this._store.dispatch(resetUpdateAirOffers());
  }

  public setUpdateAirOffersFromApi(request: PatchUpdateAirOffersRequest) {
    this._store.dispatch(setUpdateAirOffersFromApi({ call: this._api.cartsUpdateAirOffersPatch(request) }));
  }
}
