import { Injectable } from '@angular/core';
import { AnaBizLoginModel } from '@common/interfaces';
import {
  AnaBizLoginState,
  AnaBizLoginStore,
  resetAnaBizLogin,
  selectAnaBizLoginState,
  setAnaBizLogin,
  setAnaBizLoginFromApi,
  updateAnaBizLogin,
} from '@common/store';
import { SupportClass } from '@lib/components/support-class';

import { Store, select } from '@ngrx/store';
import { Observable, filter } from 'rxjs';
import { AuthorizationApiService, AuthorizationRequest } from 'src/sdk-authorization';

/**
 * ANA Bizログイン情報 store サービス
 * store情報
 * @param anaBizLoginData @see AnaBizLoginModel
 */
@Injectable({
  providedIn: 'root',
})
export class AnaBizLoginStoreService extends SupportClass {
  private _anaBizLogin$: Observable<AnaBizLoginState>;
  private _anaBizLoginData!: AnaBizLoginState;
  get anaBizLoginData() {
    return this._anaBizLoginData;
  }

  constructor(private _store: Store<AnaBizLoginStore>, private _api: AuthorizationApiService) {
    super();
    this._anaBizLogin$ = this._store.pipe(
      select(selectAnaBizLoginState),
      filter((data) => !!data)
    );
    this.subscribeService('AnaBizLoginStoreServiceData', this._anaBizLogin$, (data) => {
      this._anaBizLoginData = data;
    });
  }

  destroy(): void {
    this.deleteSubscription('AnaBizLoginStoreServiceData');
  }

  public getAnaBizLogin$() {
    return this._anaBizLogin$;
  }

  public updateAnaBizLogin(value: Partial<AnaBizLoginModel>) {
    this._store.dispatch(updateAnaBizLogin(value));
  }

  public updateAnaBizLoginByKey(key: keyof AnaBizLoginModel, value: any) {
    this._store.dispatch(updateAnaBizLogin({ [key]: value }));
  }

  public setAnaBizLogin(value: AnaBizLoginModel) {
    this._store.dispatch(setAnaBizLogin(value));
  }

  public resetAnaBizLogin() {
    this._store.dispatch(resetAnaBizLogin());
  }

  public setAnaBizLoginFromApi(request: AuthorizationRequest) {
    this._store.dispatch(setAnaBizLoginFromApi({ call: this._api.anaBizAuthorizationPost(request) }));
  }
}
