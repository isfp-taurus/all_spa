/**
 * プラン削除API store サービス
 *
 */
import { Injectable } from '@angular/core';
import { SupportClass } from '@lib/components/support-class';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs/internal/Observable';
import { filter } from 'rxjs/operators';
import { ApiErrorResponseService } from '@lib/services';
import { PlansDeletePlansRequest, ReservationService } from 'src/sdk-reservation';
import {
  deletePlansInitialState,
  DeletePlansState,
  DeletePlansStore,
  resetDeletePlans,
  selectDeletePlansState,
  setDeletePlansFromApi,
} from '@common/store/delete-plans';

/**
 * プラン削除API store サービス
 *
 * store情報
 * @param DeletePlansData @see DeletePlansState
 */
@Injectable()
export class DeletePlansStoreService extends SupportClass {
  private _DeletePlans$: Observable<DeletePlansState>;
  private _DeletePlansData: DeletePlansState = deletePlansInitialState;
  get DeletePlansData() {
    return this._DeletePlansData;
  }

  constructor(
    private _store: Store<DeletePlansStore>,
    private _api: ReservationService,
    private _apiErrorResponseService: ApiErrorResponseService
  ) {
    super();
    this._DeletePlans$ = this._store.pipe(select(selectDeletePlansState));
    this.subscribeService('DeletePlansStoreService DeletePlansObservable', this._DeletePlans$, (data) => {
      this._DeletePlansData = data;
    });
  }

  destroy() {}

  public getDeletePlans$() {
    return this._DeletePlans$;
  }

  public resetDeletePlans() {
    this._store.dispatch(resetDeletePlans());
  }

  public setDeletePlansFromApi(request: PlansDeletePlansRequest) {
    this._store.dispatch(setDeletePlansFromApi({ call: this._api.plansDeletePlansDelete(request) }));
  }
}
