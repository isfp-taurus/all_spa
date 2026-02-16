import { Injectable } from '@angular/core';
import {
  GetCompanyAccountsState,
  GetCompanyAccountsStore,
  resetGetCompanyAccounts,
  selectGetCompanyAccountsState,
  setGetCompanyAccountsFromApi,
} from '@common/store';
import { SupportClass } from '@lib/components/support-class';
import { ApiErrorResponseService } from '@lib/services';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AuthorizationApiService } from 'src/sdk-authorization';

/**
 * ANA Biz組織一覧取得 store サービス
 *
 * store情報
 * @param getCompanyAccountsData @see GetCompanyAccountsState
 */
@Injectable()
export class GetCompanyAccountsStoreService extends SupportClass {
  private _getCompanyAccounts$: Observable<GetCompanyAccountsState>;
  private _getCompanyAccountsData!: GetCompanyAccountsState;
  get getCompanyAccountsData() {
    return this._getCompanyAccountsData;
  }

  constructor(
    private _store: Store<GetCompanyAccountsStore>,
    private _api: AuthorizationApiService,
    private _apiErrorResponseService: ApiErrorResponseService
  ) {
    super();
    this._getCompanyAccounts$ = this._store.pipe(
      select(selectGetCompanyAccountsState),
      filter((data) => !!data)
    );
    this.subscribeService('GetCompanyAccountsStoreServiceData', this._getCompanyAccounts$, (data) => {
      this._getCompanyAccountsData = data;
    });
  }

  destroy(): void {
    this.deleteSubscription('GetCompanyAccountsStoreServiceData');
  }

  public getCompanyAccounts$() {
    return this._getCompanyAccounts$;
  }

  public resetGetCompanyAccounts() {
    this._store.dispatch(resetGetCompanyAccounts());
  }

  public setGetCompanyAccountsFromApi() {
    this._apiErrorResponseService.clearApiErrorResponse();
    this._store.dispatch(setGetCompanyAccountsFromApi({ call: this._api.anaBizGetCompanyAccountsPost() }));
  }
}
