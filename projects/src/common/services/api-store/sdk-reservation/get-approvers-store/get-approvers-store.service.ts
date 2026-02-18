/**
 * 予約基本情報取得API store サービス
 *
 */
import { Injectable } from '@angular/core';
import { SupportClass } from '@lib/components/support-class';
import { select, Store } from '@ngrx/store';
import { filter, Observable } from 'rxjs';
import {} from '@lib/store';
import {
  GetApproversState,
  GetApproversStore,
  resetGetApprovers,
  selectGetApproversState,
  setGetApproversFromApi,
} from '@common/store/get-approvers';
import { ApiErrorResponseService } from '@lib/services';
import { ReservationService } from 'src/sdk-reservation';
import { environment } from '../../../../../environments/environment.dev1';

/**
 * 承認者リスト取得API store サービス
 *
 * store情報
 * @paramGetApproversData @seeGetApproversState
 */
@Injectable()
export class GetApproversStoreService extends SupportClass {
  private _getApprovers$: Observable<GetApproversState>;
  private _getApproversData!: GetApproversState;
  get GetApproversData() {
    return this._getApproversData;
  }

  constructor(
    private store: Store<GetApproversStore>,
    private _api: ReservationService,
    private _apiErrorResponseService: ApiErrorResponseService
  ) {
    super();
    this._getApprovers$ = this.store.pipe(
      select(selectGetApproversState),
      filter((data) => !!data)
    );

    this.subscribeService('GetApproversStoreService GetApproversObservable', this._getApprovers$, (data) => {
      this._getApproversData = data;
    });
  }
  destroy() {}

  public getGetApprovers$() {
    return this._getApprovers$;
  }

  public resetGetApprovers() {
    this.store.dispatch(resetGetApprovers());
  }

  public setGetApproversFromAPI() {
    this._apiErrorResponseService.clearApiErrorResponse(); //　エラーを事前にクリア
    const blankObject = {} as object;
    this.store.dispatch(setGetApproversFromApi({ call: this._api.ordersAnaBizGetApproversPost(blankObject) }));
  }
}
