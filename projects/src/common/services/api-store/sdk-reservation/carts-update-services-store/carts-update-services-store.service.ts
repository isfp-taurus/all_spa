/**
 * CartsUpdateServices store サービス
 *
 */
import { Injectable } from '@angular/core';
import { SupportClass } from '@lib/components/support-class';
import { select, Store } from '@ngrx/store';
import { filter, Observable } from 'rxjs';
import {
  CartsUpdateServicesState,
  CartsUpdateServicesStore,
  resetCartsUpdateServices,
  selectCartsUpdateServicesState,
  setCartsUpdateServicesFromApi,
} from '@common/store/carts-update-services';
import { CartsUpdateServicesRequest, ReservationService } from 'src/sdk-reservation';

/**
 * サービス更新API store サービス
 *
 * store情報
 * @param cartsUpdateServicesData @see CartsUpdateServicesState
 */
@Injectable()
export class CartsUpdateServicesStoreService extends SupportClass {
  private _cartsUpdateServices$: Observable<CartsUpdateServicesState>;
  get cartsUpdateServicesData() {
    return this._cartsUpdateServicesData;
  }
  private _cartsUpdateServicesData: CartsUpdateServicesState = {
    requestIds: [],
  };

  constructor(private _store: Store<CartsUpdateServicesStore>, private _api: ReservationService) {
    super();
    this._cartsUpdateServices$ = this._store.pipe(
      select(selectCartsUpdateServicesState),
      filter((data) => !!data)
    );
    this.subscribeService('cartsUpdateServicesData', this._cartsUpdateServices$, (data) => {
      this._cartsUpdateServicesData = data;
    });
  }

  destroy() {}

  public cartsUpdateServices$() {
    return this._cartsUpdateServices$;
  }

  public resetCartsUpdateServices() {
    this._store.dispatch(resetCartsUpdateServices());
  }

  public setCartsUpdateServicesFromApi(request: CartsUpdateServicesRequest) {
    this._store.dispatch(setCartsUpdateServicesFromApi({ call: this._api.cartsUpdateServicesPost(request) }));
  }
}
