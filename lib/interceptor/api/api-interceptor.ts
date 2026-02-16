import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpInterceptor, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { environment } from '@env/environment';
import { ErrorsHandlerService, LoggerDatadogService, TealiumService } from '../../services';
import { LogType, SessionStorageName, TealiumDataKey, TealiumMode } from '../../interfaces';
import { createResponseName } from '@common/helper';
import { CommonConstants } from '@conf/app.constants';

declare const bmak: any;
declare function get_telemetry(): any;

/**
 * API接続Interceptor
 *
 * @implements HttpInterceptor
 */
@Injectable({
  providedIn: 'root',
})
export class ApiInterceptor implements HttpInterceptor {
  constructor(
    private _errorsHandlerSvc: ErrorsHandlerService,
    private _loggerSvc: LoggerDatadogService,
    private _tealiumSvc: TealiumService
  ) {}

  /**
   * インターセプト処理
   *
   * @param request
   * @param next
   * @returns
   */
  public intercept(request: HttpRequest<any>, next: HttpHandler) {
    const { url, method } = request;
    // API接続先ドメインURLが含まれる場合のみ以降の処理を行う
    const isApi: boolean = url.includes(`${environment.api.baseUrl}`);
    if (!isApi) {
      return next.handle(request);
    }

    // 共通のHTTPリクエストヘッダー
    const commonHeaders: any = {
      // クライアントを識別するID
      client_id: environment.api.clientId,
      // 秘密鍵
      client_secret: environment.api.clientSecret,
      // システム識別ID
      sys_id: CommonConstants.THREE_LETTER,
    };
    // 認証情報
    sessionStorage.getItem(SessionStorageName.ACCESS_TOKEN)
      ? (commonHeaders['Authorization'] = `Bearer ${sessionStorage.getItem(SessionStorageName.ACCESS_TOKEN)}`)
      : null;
    // ユニークID
    sessionStorage.getItem(SessionStorageName.X_CORRELATION_ID)
      ? (commonHeaders['X-Correlation-ID'] = sessionStorage.getItem(SessionStorageName.X_CORRELATION_ID))
      : null;
    // ASWユーザID
    sessionStorage.getItem(SessionStorageName.IDENTIFICATION_ID)
      ? (commonHeaders['identification_id'] = sessionStorage.getItem(SessionStorageName.IDENTIFICATION_ID))
      : null;
    // akamai InlineTelemetry
    // 付与対象URLにのみヘッダーにtelemetryを設定する
    var isTelemetry = Object.values(CommonConstants.INLINETELEMETRY_URL).some((target) => {
      const isUrlMatch = target.ENDPOINT.test(url);
      const isMethodMatch = target.METHOD === method;
      return isUrlMatch && isMethodMatch;
    });

    if (isTelemetry) {
      try {
        commonHeaders['Akamai-BM-Telemetry'] = bmak.get_telemetry();
      } catch (error) {
        console.log(error);
      }
    }
    // エラーハンドリング回避フラグ
    const commonIgnoreErrorFlg = request.body?.['commonIgnoreErrorFlg'];
    if (commonIgnoreErrorFlg !== undefined) {
      delete request.body?.['commonIgnoreErrorFlg'];
    }

    const customReq = request.clone({
      // 共通のHTTPリクエストヘッダー情報を設定する
      setHeaders: commonHeaders,
      withCredentials: true,
    });

    // ログ送信を行う
    this._sendApiIfLog(customReq);

    return next.handle(customReq).pipe(
      tap({
        next: (res) => {
          //計測タグスクリプトのAPI呼び出し時の処理を実行
          if (res instanceof HttpResponse && (window as any).trackingTags?.onApiCall !== undefined) {
            (window as any).trackingTags.onApiCall(customReq, res);
          }
        },
        error: (res) => {
          if (res instanceof HttpErrorResponse) {
            this._errorsHandlerSvc.apiErrorCommonHandler(res, commonIgnoreErrorFlg);
          }
        },
      })
    );
  }

  /**
   * ログ送信を行う
   *
   * @param customReq HTTPリクエスト情報
   */
  private _sendApiIfLog(customReq: HttpRequest<any>) {
    // ログ送信用HTTPヘッダー情報
    const logHeaders: Record<string, string | null> = {};
    customReq.headers.keys().forEach((key) => {
      logHeaders[key] = customReq.headers.get(key);
    });

    // ログ送信用パラメータ情報
    const logParams: Record<string, string | null> = {};
    customReq.params.keys().forEach((key) => {
      logParams[key] = customReq.params.get(key);
    });

    // ログ内容
    const logDatas: any = {
      // HTTPメソッド
      httpMethod: customReq.method,
      // API URL
      apiUrl: customReq.url,
      // HTTPヘッダー情報
      httpHeaders: logHeaders,
      // パラメータ情報
      params: logParams,
      // リクエストボディ
      requestBody: customReq.body,
    };

    // ログ内容を送信する
    this._loggerSvc.info(LogType.API_IF, logDatas, true);
  }

  /**
   * APIレスポンス変数名生成
   *
   * @param url
   * @param method
   * @param res
   * @returns
   */
  private _createResponseName(url: string, method: string, res: any) {
    const responseName = createResponseName(url, method, res);
    if (responseName === '') {
      return `${url}_${method}`;
    } else {
      return responseName;
    }
  }
}
