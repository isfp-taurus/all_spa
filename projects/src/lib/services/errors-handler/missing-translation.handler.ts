import { Injectable } from '@angular/core';
import { MissingTranslationHandler, MissingTranslationHandlerParams } from '@ngx-translate/core';
import { ErrorsHandlerService } from './errors-handler.service';
import { ErrorType } from '../../interfaces';
import { environment } from '@env/environment';
import { Store } from '@ngrx/store';
import { NotRetryableErrorStore, setNotRetryableError } from '../../store';
import { LoggerDatadogService } from '../logger-datadog/logger-datadog.service';

/**
 * 多言語対応用エラーハンドラ
 *
 * @implements MissingTranslationHandler
 */
@Injectable({
  providedIn: 'root',
})
export class AswMissingTranslationHandler implements MissingTranslationHandler {
  /** エラー画面遷移判定フラグ（複数回の画面遷移を防ぐため） */
  private _errorPageTransitionFlg = false;

  constructor(private _store: Store<NotRetryableErrorStore>, private _loggerSvc: LoggerDatadogService) {}
  public handle(params: MissingTranslationHandlerParams) {
    // 表示言語の文言キーが存在しない場合、運用確認ログを出力する
    this._loggerSvc.operationConfirmLog('MST0001', { 0: params.translateService.currentLang, 1: params.key });

    // 初回の場合、システムエラー画面に遷移する
    if (!this._errorPageTransitionFlg) {
      this._errorPageTransitionFlg = true;
      // TODO: ※開発中は文言キー存在しないケースただあるので、一旦エラー画面への遷移処理をやめる
      // this._store.dispatch(setNotRetryableError({ errorType: ErrorType.SYSTEM }));
    }
    if (environment.envName === 'prd') {
      return ''; // TODO: 削除予定
    } else {
      return `[${params.key}] is not in ${params.translateService.currentLang}`; // TODO: 削除予定
    }
  }
}
