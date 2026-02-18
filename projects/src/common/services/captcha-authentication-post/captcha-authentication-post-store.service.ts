/**
 * キャプチャー認証API store サービス
 *
 */
import { Injectable } from '@angular/core';
import { SupportClass } from '@lib/components/support-class';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs/internal/Observable';
import { filter } from 'rxjs/operators';
import {} from '@lib/store';
import { CaptchaAuthenticationRequest, SearchApiService } from 'src/sdk-search';
import {
  CaptchaAuthenticationPostState,
  CaptchaAuthenticationPostStore,
  resetCaptchaAuthenticationPost,
  selectCaptchaAuthenticationPostState,
  setCaptchaAuthenticationPostFromApi,
} from '@common/store/captcha-authentication-post';

/**
 * キャプチャー認証API store サービス
 *
 * store情報
 * @param CaptchaAuthenticationData @see CaptchaAuthenticationStatusGetState
 */
@Injectable()
export class CaptchaAuthenticationPostService extends SupportClass {
  private _captchaAuthentication: Observable<CaptchaAuthenticationPostState>;
  private _captchaAuthenticationData!: CaptchaAuthenticationPostState;
  get CaptchaAuthenticationData() {
    return this._captchaAuthenticationData;
  }

  constructor(private _store: Store<CaptchaAuthenticationPostStore>, private _searchService: SearchApiService) {
    super();
    this._captchaAuthentication = this._store.pipe(
      select(selectCaptchaAuthenticationPostState),
      filter((data) => !!data)
    );
    this.subscribeService(
      'CaptchaAuthenticationStoreService CaptchaAuthenticationObservable',
      this._captchaAuthentication,
      (data) => {
        this._captchaAuthenticationData = data;
      }
    );
  }

  destroy() {}

  public getCaptchaAuthenticationPost() {
    return this._captchaAuthentication;
  }

  public resetCaptchaAuthenticationPost() {
    this._store.dispatch(resetCaptchaAuthenticationPost());
  }

  public setCaptchaAuthenticationPostFromApi(request: CaptchaAuthenticationRequest) {
    this._store.dispatch(
      setCaptchaAuthenticationPostFromApi({ call: this._searchService.captchaAuthenticationPost(request) })
    );
  }
}
