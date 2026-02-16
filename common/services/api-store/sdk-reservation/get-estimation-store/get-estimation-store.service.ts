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
import { ReservationService, PlansGetEstimationRequest } from 'src/sdk-reservation';
import {
  getEstimationInitialState,
  GetEstimationState,
  GetEstimationStore,
  resetGetEstimation,
  selectGetEstimationState,
  setGetEstimationFromApi,
} from '@common/store/get-estimation';

/**
 * プラン名称変更API store サービス
 *
 * store情報
 * @param GetEstimationData @see GetEstimationState
 */
@Injectable()
export class GetEstimationStoreService extends SupportClass {
  private _GetEstimation$: Observable<GetEstimationState>;
  private _GetEstimationData: GetEstimationState = getEstimationInitialState;
  get GetEstimationData() {
    return this._GetEstimationData;
  }

  constructor(
    private _store: Store<GetEstimationStore>,
    private _api: ReservationService,
    private _apiErrorResponseService: ApiErrorResponseService
  ) {
    super();
    this._GetEstimation$ = this._store.pipe(
      select(selectGetEstimationState),
      filter((data) => !!data)
    );
    this.subscribeService('GetEstimationStoreService GetEstimationObservable', this._GetEstimation$, (data) => {
      this._GetEstimationData = data;
    });
  }

  destroy() {}

  public getGetEstimation$() {
    return this._GetEstimation$;
  }

  public resetGetEstimation() {
    this._store.dispatch(resetGetEstimation());
  }

  public setGetEstimationFromApi(request: PlansGetEstimationRequest) {
    this._store.dispatch(setGetEstimationFromApi({ call: this._api.plansGetEstimationPost(request) }));
  }
}
