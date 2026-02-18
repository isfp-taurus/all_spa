import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { filter, map, Observable, take } from 'rxjs';
import { UserApiService } from 'src/sdk-user';
import {
  GetEncryptedLoginInfoState,
  GetEncryptedLoginInfoStore,
  selectGetEncryptedLoginInfoState,
  setGetEncryptedLoginInfoFromApi,
} from '../../store';

/**
 * ログイン情報ストア用サービス
 */
@Injectable({
  providedIn: 'root',
})
export class LoginInfoStoreService {
  constructor(private _store: Store<GetEncryptedLoginInfoStore>, private _api: UserApiService) {}

  /**
   * 暗号化済みログイン情報取得APIを呼び出し、結果通知用のObservableを取得する。
   * @returns API呼び出し結果の通知用Observable
   */
  getEncryptedLoginInfo$() {
    this._store.dispatch(setGetEncryptedLoginInfoFromApi({ call: this._api.getEncryptedLoginInfoGet() }));

    return this._store.pipe(
      select(selectGetEncryptedLoginInfoState),
      filter((data) => !!data && !!data.model)
    );
  }
}
