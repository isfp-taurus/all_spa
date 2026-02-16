/**
 * プラン名称変更API store サービス
 *
 */
import { Injectable } from '@angular/core';
import { SupportClass } from '@lib/components/support-class';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs/internal/Observable';
import { filter } from 'rxjs/operators';
import { ApiErrorResponseService } from '@lib/services';
import { PlansUpdatePlannameRequest, ReservationService } from 'src/sdk-reservation';
import {
  UpdatePlannameState,
  UpdatePlannameStore,
  resetUpdatePlanname,
  selectUpdatePlannameState,
  setUpdatePlannameFromApi,
  updatePlannameInitialState,
} from '@common/store/update-planname';

/**
 * プラン名称変更API store サービス
 *
 * store情報
 * @param UpdatePlannameData @see UpdatePlannameState
 */
@Injectable()
export class UpdatePlannameStoreService extends SupportClass {
  private _UpdatePlanname$: Observable<UpdatePlannameState>;
  private _UpdatePlannameData: UpdatePlannameState = updatePlannameInitialState;
  get UpdatePlannameData() {
    return this._UpdatePlannameData;
  }

  constructor(
    private _store: Store<UpdatePlannameStore>,
    private _api: ReservationService,
    private _apiErrorResponseService: ApiErrorResponseService
  ) {
    super();
    this._UpdatePlanname$ = this._store.pipe(
      select(selectUpdatePlannameState),
      filter((data) => !!data)
    );
    this.subscribeService('UpdatePlannameStoreService UpdatePlannameObservable', this._UpdatePlanname$, (data) => {
      this._UpdatePlannameData = data;
    });
  }

  destroy() {}

  public getUpdatePlanname$() {
    return this._UpdatePlanname$;
  }

  public resetUpdatePlanname() {
    this._store.dispatch(resetUpdatePlanname());
  }

  public setUpdatePlannameFromApi(request: PlansUpdatePlannameRequest) {
    this._store.dispatch(setUpdatePlannameFromApi({ call: this._api.plansUpdatePlannamePatch(request) }));
  }
}
