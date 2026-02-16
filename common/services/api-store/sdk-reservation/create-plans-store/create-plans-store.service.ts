/**
 * カート作成API store サービス
 *
 */
import { Injectable } from '@angular/core';
import { SupportClass } from '@lib/components/support-class';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs/internal/Observable';
import { filter } from 'rxjs/operators';
import { PlansCreatePlansRequest, ReservationService } from 'src/sdk-reservation';
import { ApiErrorResponseService } from '@lib/services';
import {
  createPlansInitialState,
  CreatePlansState,
  CreatePlansStore,
  resetCreatePlans,
  selectCreatePlansState,
  setCreatePlansFromApi,
} from '@common/store/create-plans';

/**
 * カート作成API store サービス
 *
 * store情報
 * @param CreatePlansData @see CreatePlansState
 */
@Injectable()
export class CreatePlansStoreService extends SupportClass {
  private _CreatePlans$: Observable<CreatePlansState>;
  private _CreatePlansData: CreatePlansState = createPlansInitialState;
  get CreatePlansData() {
    return this._CreatePlansData;
  }

  constructor(
    private _store: Store<CreatePlansStore>,
    private _api: ReservationService,
    private _apiErrorResponseService: ApiErrorResponseService
  ) {
    super();
    this._CreatePlans$ = this._store.pipe(
      select(selectCreatePlansState),
      filter((data) => !!data)
    );
    this.subscribeService('CreatePlansStoreService CreatePlansObservable', this._CreatePlans$, (data) => {
      this._CreatePlansData = data;
    });
  }

  destroy() {}

  public getCreatePlans$() {
    return this._CreatePlans$;
  }

  public resetCreatePlans() {
    this._store.dispatch(resetCreatePlans());
  }

  public setCreatePlansFromApi(request: PlansCreatePlansRequest) {
    this._store.dispatch(setCreatePlansFromApi({ call: this._api.plansCreatePlansPost(request) }));
  }
}
