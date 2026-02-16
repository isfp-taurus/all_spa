/**
 * 搭乗者情報更新API store サービス
 *
 */
import { Injectable } from '@angular/core';
import { SupportClass } from '@lib/components/support-class';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs/internal/Observable';
import { filter } from 'rxjs/operators';
import { ApiErrorResponseService } from '@lib/services/api-error-response/api-error-response.service';
import { CartsUpdateTravelersRequest, ReservationService } from 'src/sdk-reservation';
import {
  UpdateTravelersState,
  UpdateTravelersStore,
  resetUpdateTravelers,
  selectUpdateTravelersState,
  setUpdateTravelersFromApi,
} from '@common/store/update-travelers';

/**
 * 搭乗者情報更新API store サービス
 *
 * store情報
 * @param getMemberInformationData @see GetMemberInformationState
 */
@Injectable()
export class UpdateTravelersInformationStoreService extends SupportClass {
  private _updateTravelers$: Observable<UpdateTravelersState>;
  private _updateTravelersData!: UpdateTravelersState;
  get getMemberInformationData() {
    return this._updateTravelersData;
  }

  constructor(
    private store: Store<UpdateTravelersStore>,
    private api: ReservationService,
    private _apiErrorResponseService: ApiErrorResponseService
  ) {
    super();
    this._updateTravelers$ = this.store.pipe(
      select(selectUpdateTravelersState),
      filter((data) => !!data)
    );
    this.subscribeService(
      'UpdateTravelersInformationStoreService UpdateTravelersInformationObservable',
      this._updateTravelers$,
      (data) => {
        this._updateTravelersData = data;
      }
    );
  }

  destroy() {}

  public getGetUpdateTravelers$() {
    return this._updateTravelers$;
  }

  public resetUpdateTravelers() {
    this.store.dispatch(resetUpdateTravelers());
  }

  public setUpdateTravelersFromApi(request: CartsUpdateTravelersRequest) {
    this.store.dispatch(setUpdateTravelersFromApi({ call: this.api.cartsUpdateTravelersPatch(request) }));
  }
}
