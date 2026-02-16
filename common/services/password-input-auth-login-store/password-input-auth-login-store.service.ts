import { Injectable } from '@angular/core';
import {
  AuthLoginState,
  AuthLoginStore,
  selectAuthLoginState,
  setAuthLoginFromApi,
} from '../../../lib/store/auth-login';
import { SupportClass } from '@lib/components/support-class';
import { ApiErrorResponseService } from '@lib/services';
import { select, Store } from '@ngrx/store';
import { filter, Observable } from 'rxjs';
import { AuthLoginRequest, MemberApiService } from 'src/sdk-member';

@Injectable({
  providedIn: 'root',
})
export class PasswordInputAuthLoginStoreService extends SupportClass {
  // API呼び出し結果の通知用Observable
  private _AuthLogin$: Observable<AuthLoginState>;

  constructor(
    private _store: Store<AuthLoginStore>,
    private _api: MemberApiService,
    private _apiErr: ApiErrorResponseService
  ) {
    super();

    // APIの結果をselectして内容が参照できるようにする
    // 参照内容が存在することを担保できるようにフィルタもしておく
    this._AuthLogin$ = this._store.pipe(
      select(selectAuthLoginState),
      filter((data) => !!data)
    );
  }

  /**
   * API呼び出し
   * @param req リクエストパラメータ
   */
  public callApi(req: AuthLoginRequest) {
    // エラーを事前クリア
    this._apiErr.clearApiErrorResponse();

    // API呼び出しアクションをdispatch
    this._store.dispatch(
      setAuthLoginFromApi({
        call: this._api.authLoginPost(req),
      })
    );
  }

  /**
   * API呼び出し結果の通知用Observableの取得
   * @returns API呼び出し結果の通知用Observable
   */
  public getAuthLogin$() {
    return this._AuthLogin$;
  }

  override destroy() {
    throw new Error('Method not implemented.');
  }
}
