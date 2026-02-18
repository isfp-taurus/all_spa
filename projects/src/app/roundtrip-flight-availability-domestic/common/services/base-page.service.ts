import { Injectable } from '@angular/core';
import { DynamicParams, LogType } from '@lib/interfaces';
import {
  AlertMessageStoreService,
  AswCommonStoreService,
  DynamicContentService,
  ErrorsHandlerService,
  LoggerDatadogService,
  PageInitService,
} from '@lib/services';
import { Observable, Subscription } from 'rxjs';

/**
 * ベースページService
 */
@Injectable({
  providedIn: 'root',
})
export class BasePageService {
  constructor(
    private _pageInitSvc: PageInitService,
    private _aswCommonSvc: AswCommonStoreService,
    private _loggerSvc: LoggerDatadogService,
    private _dcSvc: DynamicContentService,
    private _alertMsgSvc: AlertMessageStoreService,
    private _errorHandlerSvc: ErrorsHandlerService
  ) {}

  /**
   * 初期化開始処理を呼び出す
   * @param functionId 機能ID
   * @param pageId 画面ID
   */
  public startInit(functionId: string, pageId: string) {
    // ローディング画面の表示モードとしてプロモーションモードを指定して画面の初期化処理(G01-003)の初期化開始処理を呼び出す
    this._pageInitSvc.startInit();
    // 画面情報を設定する
    // 例）functionId：E01(発券後予約変更) pageId：P020(空席照会結果)
    this._aswCommonSvc.updateAswCommon({
      functionId: functionId,
      pageId: pageId,
    });
    // PageViewEventログを設定する
    this._loggerSvc.info(LogType.PAGE_VIEW, {});
  }

  /**
   * 初期化終了処理を呼び出す
   * @param dynamicParams$ 動的文言判定用情報
   */
  public endInit(dynamicParams$?: Observable<DynamicParams> | null) {
    this._pageInitSvc.endInit(dynamicParams$);
  }

  /**
   * unsubscribe処理を行う
   * @param subscriptions Subscription
   */
  public unsubscribe(subscriptions?: Subscription) {
    subscriptions?.unsubscribe();
    this._pageInitSvc.pageInitUnsubscribe();
    this._dcSvc.clearDynamicContent();
    this._errorHandlerSvc.clearRetryableError();
    this._alertMsgSvc.removeAllAlertMessage();
  }
}
