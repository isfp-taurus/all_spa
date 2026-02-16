/**
 * GetMeal store サービス
 *
 */
import { Injectable } from '@angular/core';
import { SupportClass } from '@lib/components/support-class';
import { select, Store } from '@ngrx/store';
import { filter, Observable } from 'rxjs';
import {
  GetMealState,
  GetMealStore,
  resetGetMeal,
  selectGetMealState,
  setGetMealFromApi,
} from '@common/store/get-meal';
import { GetMealRequest, ServicingApiService } from 'src/sdk-servicing';

/**
 * GetMeal store サービス
 *
 * store情報
 * @param getMealData @see GetMealState
 */
@Injectable()
export class GetMealStoreService extends SupportClass {
  private _getMeal$: Observable<GetMealState>;
  public getMealData!: GetMealState;

  constructor(private store: Store<GetMealStore>, private api: ServicingApiService) {
    super();
    this._getMeal$ = this.store.pipe(
      select(selectGetMealState),
      filter((data) => !!data)
    );
    this.subscribeService('GetMealStoreServiceData', this._getMeal$, (data) => {
      this.getMealData = data;
    });
  }

  destroy() {}

  public getMeal$() {
    return this._getMeal$;
  }

  public resetGetMeal() {
    this.store.dispatch(resetGetMeal());
  }

  public setGetMealFromApi(request: GetMealRequest) {
    this.store.dispatch(setGetMealFromApi({ call: this.api.getMealPost(request) }));
  }
}
