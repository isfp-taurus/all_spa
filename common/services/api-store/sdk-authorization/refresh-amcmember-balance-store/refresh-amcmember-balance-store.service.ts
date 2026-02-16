/**
 * 会員情報残高更新API store サービス
 *
 */
import { Injectable } from '@angular/core';
import { SupportClass } from '@lib/components/support-class';
import { select, Store } from '@ngrx/store';
import { filter, Observable } from 'rxjs';
import {} from '@lib/store';
import { AuthorizationApiService } from 'src/sdk-authorization';
import {
  RefreshAmcmemberBalanceState,
  RefreshAmcmemberBalanceStore,
  resetRefreshAmcmemberBalance,
  selectRefreshAmcmemberBalanceState,
  setRefreshAmcmemberBalanceFromApi,
} from '@common/store/refresh-amcmember-balance';
import { ApiErrorResponseService } from '@lib/services/api-error-response/api-error-response.service';

/**
 * 会員情報残高更新API store サービス
 *
 * store情報
 * @param refreshAmcmemberBalanceData @see RefreshAmcmemberBalanceState
 */
@Injectable()
export class RefreshAmcmemberBalanceStoreService extends SupportClass {
  private _refreshAmcmemberBalance$: Observable<RefreshAmcmemberBalanceState>;
  private _refreshAmcmemberBalanceData!: RefreshAmcmemberBalanceState;
  get refreshAmcmemberBalanceData() {
    return this._refreshAmcmemberBalanceData;
  }

  constructor(
    private store: Store<RefreshAmcmemberBalanceStore>,
    private api: AuthorizationApiService,
    private _apiErrorResponseService: ApiErrorResponseService
  ) {
    super();
    this._refreshAmcmemberBalance$ = this.store.pipe(
      select(selectRefreshAmcmemberBalanceState),
      filter((data) => !!data)
    );
    this.subscribeService('refreshAmcmemberBalance', this._refreshAmcmemberBalance$, (data) => {
      this._refreshAmcmemberBalanceData = data;
    });
  }

  destroy() {}

  public getRefreshAmcmemberBalance$() {
    return this._refreshAmcmemberBalance$;
  }

  public resetRefreshAmcmemberBalance() {
    this.store.dispatch(resetRefreshAmcmemberBalance());
  }

  public setRefreshAmcmemberBalanceFromApi(request: object) {
    this.store.dispatch(setRefreshAmcmemberBalanceFromApi({ call: this.api.refreshAmcmemberBalancePost(request) }));
  }
}
