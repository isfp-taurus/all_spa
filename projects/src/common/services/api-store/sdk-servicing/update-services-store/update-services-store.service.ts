/**
 * シートマップ取得API store サービス
 *
 */
import { Injectable } from '@angular/core';
import { SupportClass } from '@lib/components/support-class';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs/internal/Observable';
import { filter } from 'rxjs/operators';
import { ServicingApiService, UpdateServicesRequest } from 'src/sdk-servicing';
import {
  resetUpdateServices,
  selectUpdateServicesState,
  setUpdateServicesFromApi,
  UpdateServicesState,
  UpdateServicesStore,
} from '@common/store/update-services';

/**
 * サービス情報登録API store サービス
 *
 * store情報
 * @param updateServicesData @see UpdateServicesStore
 */
@Injectable()
export class UpdateServicesStoreService extends SupportClass {
  private _updateServices$: Observable<UpdateServicesState>;
  private _updateServicesData!: UpdateServicesState;
  get updateServicesData() {
    return this._updateServicesData;
  }

  constructor(private store: Store<UpdateServicesStore>, private api: ServicingApiService) {
    super();
    this._updateServices$ = this.store.pipe(
      select(selectUpdateServicesState),
      filter((data) => !!data)
    );
    this.subscribeService('updateServicesStoreService', this._updateServices$, (data) => {
      this._updateServicesData = data;
    });
  }

  destroy() {}

  public getupdateServicesObservable() {
    return this._updateServices$;
  }

  public resetupdateServices() {
    this.store.dispatch(resetUpdateServices());
  }

  public setupdateServicesFromApi(request: UpdateServicesRequest) {
    this.store.dispatch(setUpdateServicesFromApi({ call: this.api.ordersUpdateServicesPost(request) }));
  }
}
