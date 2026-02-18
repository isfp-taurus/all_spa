/**
 * 特典利用者情報取得API store サービス
 *
 */
import { Injectable } from '@angular/core';
import { SupportClass } from '../../components/support-class';
import { select, Store } from '@ngrx/store';
import {
  GetAwardUsersState,
  GetAwardUsersStore,
  resetGetAwardUsers,
  selectGetAwardUsersState,
  setGetAwardUsersFromApi,
} from '../../store';
import { AmcmemberApiService } from 'src/sdk-amcmember';
import { ApiErrorResponseService } from '../api-error-response/api-error-response.service';
import { Observable } from 'rxjs/internal/Observable';
import { filter } from 'rxjs/operators';

/**
 * 特典利用者情報取得API store サービス
 * store情報
 * @param getAwardUsersData @see GetAwardUsersState
 */
@Injectable()
export class GetAwardUsersStoreService extends SupportClass {
  private _getAwardUsers$: Observable<GetAwardUsersState>;
  private _getAwardUsersData!: GetAwardUsersState;
  get getAwardUsersData() {
    return this._getAwardUsersData;
  }

  constructor(
    private _store: Store<GetAwardUsersStore>,
    private _api: AmcmemberApiService,
    private _apiErrorResponseService: ApiErrorResponseService
  ) {
    super();
    this._getAwardUsers$ = this._store.pipe(
      select(selectGetAwardUsersState),
      filter((data) => !!data)
    );
    this.subscribeService('GetAwardUsersStoreServiceData', this._getAwardUsers$, (data) => {
      this._getAwardUsersData = data;
    });
  }

  destroy() {}

  public getAwardUsers$() {
    return this._getAwardUsers$;
  }

  public resetGetAwardUsers() {
    this._store.dispatch(resetGetAwardUsers());
  }

  public setGetAwardUsersFromApi() {
    this._apiErrorResponseService.clearApiErrorResponse(); //　エラーを事前にクリア
    this._store.dispatch(setGetAwardUsersFromApi({ call: this._api.getAwardUsersPost({}) }));
  }
}
