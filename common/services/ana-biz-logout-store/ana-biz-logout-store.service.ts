import { Injectable } from '@angular/core';
import {
  AnaBizLogoutState,
  AnaBizLogoutStore,
  resetAnaBizLogout,
  selectAnaBizLogoutState,
  setAnaBizLogoutFromApi,
} from '@common/store';
import { SupportClass } from '@lib/components/support-class';
import { Store, select } from '@ngrx/store';
import { Observable, filter } from 'rxjs';
import { AuthorizationApiService } from 'src/sdk-authorization';

/**
 * ANA Bizログアウト情報 store サービス
 * store情報
 * @param anaBizLogoutData @see AnaBizLogoutModel
 */
@Injectable({
  providedIn: 'root',
})
export class AnaBizLogoutStoreService extends SupportClass {
  private _anaBizLogout$: Observable<AnaBizLogoutState>;
  private _anaBizLogoutData!: AnaBizLogoutState;
  get anaBizLogoutData() {
    return this._anaBizLogoutData;
  }

  constructor(private _store: Store<AnaBizLogoutStore>, private _api: AuthorizationApiService) {
    super();
    this._anaBizLogout$ = this._store.pipe(
      select(selectAnaBizLogoutState),
      filter((data) => !!data)
    );
    this.subscribeService('AnaBizLogoutStoreServiceData', this._anaBizLogout$, (data) => {
      this._anaBizLogoutData = data;
    });
  }

  destroy(): void {
    this.deleteSubscription('AnaBizLogoutStoreServiceData');
  }

  public getAnaBizLogout$() {
    return this._anaBizLogout$;
  }

  public resetAnaBizLogout() {
    this._store.dispatch(resetAnaBizLogout());
  }

  public setAnaBizLogoutFromApi(request: object) {
    this._store.dispatch(setAnaBizLogoutFromApi({ call: this._api.anaBizLogoutPost(request) }));
  }
}
