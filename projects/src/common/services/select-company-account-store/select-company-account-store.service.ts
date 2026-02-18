import { Injectable } from '@angular/core';
import {
  SelectCompanyAccountState,
  SelectCompanyAccountStore,
  resetSelectCompanyAccount,
  selectSelectCompanyAccountState,
  setSelectCompanyAccountFromApi,
} from '@common/store';
import { SupportClass } from '@lib/components/support-class';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AuthorizationApiService, SelectCompanyAccountRequest } from 'src/sdk-authorization';

/**
 * ANA Biz組織選択 storeサービス
 *
 * store情報
 * @param selectCompanyAccountState @see SelectCompanyAccountState
 */
@Injectable()
export class SelectCompanyAccountStoreService extends SupportClass {
  private _selectCompanyAccount$: Observable<SelectCompanyAccountState>;
  private _selectCompanyAccountData!: SelectCompanyAccountState;
  get selectCompanyAccountData() {
    return this._selectCompanyAccountData;
  }

  constructor(private _store: Store<SelectCompanyAccountStore>, private _api: AuthorizationApiService) {
    super();
    this._selectCompanyAccount$ = this._store.pipe(
      select(selectSelectCompanyAccountState),
      filter((data) => !!data)
    );
    this.subscribeService('SelectCompanyAccountStoreServiceData', this._selectCompanyAccount$, (data) => {
      this._selectCompanyAccountData = data;
    });
  }

  destroy(): void {}

  public selectCompanyAccount$() {
    return this._selectCompanyAccount$;
  }

  public resetSelectCompanyAccount() {
    this._store.dispatch(resetSelectCompanyAccount());
  }

  public setSelectCompanyAccountFromApi(request: SelectCompanyAccountRequest) {
    this._store.dispatch(setSelectCompanyAccountFromApi({ call: this._api.anaBizSelectCompanyAccountPost(request) }));
  }
}
