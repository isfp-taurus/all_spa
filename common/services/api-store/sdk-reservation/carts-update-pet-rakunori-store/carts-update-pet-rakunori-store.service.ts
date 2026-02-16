/**
 * CartsUpdatePetRakunori store サービス
 *
 */
import { Injectable } from '@angular/core';
import { SupportClass } from '@lib/components/support-class';
import { select, Store } from '@ngrx/store';
import { filter, Observable } from 'rxjs';
import {
  CartsUpdatePetRakunoriState,
  CartsUpdatePetRakunoriStore,
  resetCartsUpdatePetRakunori,
  selectCartsUpdatePetRakunoriState,
  setCartsUpdatePetRakunoriFromApi,
} from '@common/store/carts-update-pet-rakunori';
import { CartsUpdatePetRakunoriRequest, ReservationService } from 'src/sdk-reservation';

/**
 * サービス更新API store サービス
 *
 * store情報
 * @param cartsUpdatePetRakunoriData @see CartsUpdateServicesState
 */
@Injectable()
export class CartsUpdatePetRakunoriStoreService extends SupportClass {
  private _cartsUpdatePetRakunori$: Observable<CartsUpdatePetRakunoriState>;
  get cartsUpdatePetRakunoriData() {
    return this._cartsUpdatePetRakunoriData;
  }
  private _cartsUpdatePetRakunoriData: CartsUpdatePetRakunoriState = {
    requestIds: [],
  };

  constructor(private _store: Store<CartsUpdatePetRakunoriStore>, private _api: ReservationService) {
    super();
    this._cartsUpdatePetRakunori$ = this._store.pipe(
      select(selectCartsUpdatePetRakunoriState),
      filter((data) => !!data)
    );
    this.subscribeService('cartsUpdatePetRakunoriData', this._cartsUpdatePetRakunori$, (data) => {
      this._cartsUpdatePetRakunoriData = data;
    });
  }

  destroy() {}

  public cartsUpdatePetRakunori$() {
    return this._cartsUpdatePetRakunori$;
  }

  public resetCartsUpdatePetRakunori() {
    this._store.dispatch(resetCartsUpdatePetRakunori());
  }

  public setCartsUpdatePetRakunoriFromApi(request: CartsUpdatePetRakunoriRequest) {
    this._store.dispatch(setCartsUpdatePetRakunoriFromApi({ call: this._api.cartsUpdatePetRakunoriPost(request) }));
  }
}
