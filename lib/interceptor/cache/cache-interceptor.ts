import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpErrorResponse } from '@angular/common/http';
import { environment } from '@env/environment';
import { getFingerprintsVersion } from '../../helpers';
import { tap } from 'rxjs/operators';
import { LoggerDatadogService } from '../../services';
import { Store } from '@ngrx/store';
import { NotRetryableErrorStore, setNotRetryableError } from '../../store';
import { ErrorType } from '../../interfaces';

/**
 * Akamai Cache接続Interceptor
 *
 * @implements HttpInterceptor
 */
@Injectable({
  providedIn: 'root',
})
export class CacheInterceptor implements HttpInterceptor {
  /** エラー画面遷移判定フラグ（複数回の画面遷移を防ぐため） */
  private _errorPageTransitionFlg = false;

  constructor(private _loggerSvc: LoggerDatadogService, private _store: Store<NotRetryableErrorStore>) {}

  /**
   * インターセプト処理
   *
   * @param request
   * @param next
   * @returns
   */
  public intercept(request: HttpRequest<any>, next: HttpHandler) {
    const { url } = request;
    const {
      baseUrl,
      app: { cache },
    } = environment.spa;
    // Akamai Cache接続先ドメインURLが含まれる場合のみ以降の処理を行う
    const isAkamaiCache: boolean = url.includes(`${baseUrl}${cache}`);
    if (!isAkamaiCache) {
      return next.handle(request);
    }

    // Fingerprints.jsから該当URLファイルのバージョンを取得
    let customUrl = '';
    const cacheVersion = getFingerprintsVersion(url);
    if (cacheVersion) {
      customUrl = `?${cacheVersion}`;
    }

    const customReq = request.clone({
      // URLをバージョン付きのURLに置き換える
      url: `${url}${customUrl}`,
    });

    return next.handle(customReq).pipe(
      tap({
        next: (res) => {},
        error: (res) => {
          if (res instanceof HttpErrorResponse) {
            // Akamai Cache取得に失敗した場合、運用確認ログを出力する
            this._loggerSvc.operationConfirmLog('MST0002', { 0: res.url || '' });

            // 初回失敗した場合、システムエラー画面に遷移する
            if (!this._errorPageTransitionFlg) {
              this._errorPageTransitionFlg = true;
              // TODO: ※開発中はキャッシュファイル取得できないケースがあるため、一旦エラー画面への遷移処理を止める
              // this._store.dispatch(setNotRetryableError({ errorType: ErrorType.SYSTEM }));
            }
          }
        },
      })
    );
  }
}
