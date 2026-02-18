/**
 * 運賃ルール・手荷物ルール取得API store サービス
 *
 */
import { Injectable } from '@angular/core';
import { SupportClass } from '@lib/components/support-class';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs/internal/Observable';
import { filter } from 'rxjs/operators';
import { FareConditionsRequest } from 'src/sdk-servicing';
import {
  FareConditionsState,
  FareConditionsStore,
  resetFareConditions,
  selectFareConditionsState,
  setFareConditionsFromApi,
} from '@common/store/fare-conditions';
import { ServicingApiService } from 'src/sdk-servicing';
import { ApiErrorResponseService } from '@lib/services/api-error-response/api-error-response.service';

/**
 * 運賃ルール・手荷物ルール取得API store サービス
 *
 * store情報
 * @param FareConditionsData @see FareConditionsState
 */
@Injectable()
export class FareConditionsStoreService extends SupportClass {
  private _fareConditions$: Observable<FareConditionsState>;
  private _fareConditionsData!: FareConditionsState;
  get fareConditionsData() {
    return this._fareConditionsData;
  }

  constructor(
    private store: Store<FareConditionsStore>,
    private api: ServicingApiService,
    private _apiErrorResponseService: ApiErrorResponseService
  ) {
    super();
    this._fareConditions$ = this.store.pipe(
      select(selectFareConditionsState),
      filter((data) => !!data)
    );
    this.subscribeService('FareConditionsStoreService', this._fareConditions$, (data) => {
      this._fareConditionsData = data;
    });
  }
  destroy() {}

  public getFareConditions$() {
    return this._fareConditions$;
  }

  public resetFareConditions() {
    this.store.dispatch(resetFareConditions());
  }

  public setFareConditionsFromApi(request: FareConditionsRequest) {
    this.store.dispatch(setFareConditionsFromApi({ call: this.api.fareConditionsPost(request) }));
  }
}
