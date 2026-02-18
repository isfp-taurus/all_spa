/**
 * プラン作成API store サービス
 *
 */
import { Injectable } from '@angular/core';
import { SupportClass } from '@lib/components/support-class';
import { select, Store } from '@ngrx/store';
import { filter, Observable } from 'rxjs';
import { ReservationService, PlansCreatePlansRequest } from 'src/sdk-reservation';
import {
  PlansCreatePlansState,
  PlansCreatePlansStore,
  resetPlansCreatePlans,
  selectPlansCreatePlansState,
  setPlansCreatePlansFromApi,
} from '@common/store/plans-create-plans';
import { ApiErrorResponseService } from '@lib/services/api-error-response/api-error-response.service';

/**
 * プラン作成API store サービス
 *
 * store情報
 * @param plansCreatePlansData @see PlansCreatePlansState
 */
@Injectable()
export class PlansCreatePlansStoreService extends SupportClass {
  private _plansCreatePlans$: Observable<PlansCreatePlansState>;
  private _plansCreatePlansData!: PlansCreatePlansState;
  get plansCreatePlansData() {
    return this._plansCreatePlansData;
  }

  constructor(
    private store: Store<PlansCreatePlansStore>,
    private api: ReservationService,
    private _apiErrorResponseService: ApiErrorResponseService
  ) {
    super();
    this._plansCreatePlans$ = this.store.pipe(
      select(selectPlansCreatePlansState),
      filter((data) => !!data)
    );
    this.subscribeService('plansCreatePlans', this._plansCreatePlans$, (data) => {
      this._plansCreatePlansData = data;
    });
  }

  destroy() {}

  public getPlansCreatePlans$() {
    return this._plansCreatePlans$;
  }

  public resetPlansCreatePlans() {
    this.store.dispatch(resetPlansCreatePlans());
  }

  public setPlansCreatePlansFromApi(request: PlansCreatePlansRequest) {
    this.store.dispatch(setPlansCreatePlansFromApi({ call: this.api.plansCreatePlansPost(request) }));
  }
}
