/**
 * プランリスト取得API store サービス
 *
 */
import { Injectable } from '@angular/core';
import { SupportClass } from '@lib/components/support-class';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs/internal/Observable';
import { filter } from 'rxjs/operators';
import { ApiErrorResponseService } from '@lib/services';
import { PlansGetPlansRequest, ReservationService } from 'src/sdk-reservation';
import {
  getPlansInitialState,
  GetPlansState,
  GetPlansStore,
  resetGetPlans,
  selectGetPlansState,
  setGetPlansFromApi,
} from '@common/store/get-plans';

/**
 * プランリスト取得API store サービス
 *
 * store情報
 * @param GetPlansData @see GetPlansState
 */
@Injectable()
export class GetPlansStoreService extends SupportClass {
  private _GetPlans$: Observable<GetPlansState>;
  private _GetPlansData: GetPlansState = getPlansInitialState;
  get GetPlansData() {
    return this._GetPlansData;
  }

  constructor(
    private _store: Store<GetPlansStore>,
    private _api: ReservationService,
    private _apiErrorResponseService: ApiErrorResponseService
  ) {
    super();
    this._GetPlans$ = this._store.pipe(
      select(selectGetPlansState),
      filter((data) => !!data)
    );
    this.subscribeService('GetPlansStoreService GetPlansObservable', this._GetPlans$, (data) => {
      this._GetPlansData = data;
    });
  }

  destroy() {}

  public getGetPlans$() {
    return this._GetPlans$;
  }

  public resetGetPlans() {
    this._store.dispatch(resetGetPlans());
  }

  public setGetPlansFromApi(request: PlansGetPlansRequest) {
    this._store.dispatch(setGetPlansFromApi({ call: this._api.plansGetPlansPost(request) }));
  }
}
