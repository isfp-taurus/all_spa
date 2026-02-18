import { Injectable, Inject, Injector, OnDestroy } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LogsInitConfiguration, datadogLogs } from '@datadog/browser-logs';
import { environment } from '@env/environment';
import { LogType, LogCustomMsg, LogLevel, SessionStorageName, OperationConfirmLogMsgParams } from '../../interfaces';
import {
  DataDogConfig,
  DATADOG_LOGS_TOKEN,
  DataDogCustomConfig,
  datadogDefConfig,
  logDefReplaceRules,
} from './logger-datadog.config';
import { Observable, Subscription } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AswCommonStoreService } from '../asw-common-store/asw-common-store.service';
import { AswContextStoreService } from '../asw-context-store/asw-context-store.service';
import { AswServiceStoreService } from '../asw-service-store/asw-service-store.service';
import { AswMasterService } from '../asw-master/asw-master.service';
import { MasterStoreKey } from '@conf/asw-master.config';

/**
 * ログ出力Service
 */
@Injectable()
export class LoggerDatadogService implements OnDestroy {
  private _subscription: Subscription = new Subscription();
  /**
   * Datadogログ構成
   */
  private _config: DataDogConfig;

  constructor(
    @Inject(DATADOG_LOGS_TOKEN) configuration: DataDogCustomConfig,
    private _injector: Injector,
    private _http: HttpClient
  ) {
    this._config = {
      ...datadogDefConfig,
      ...configuration,
    };
  }

  /**
   * アプリケーションバージョン情報のファイル取得
   */
  get version$(): Observable<string> {
    return this._http
      .get<{
        version: string;
      }>(`${environment.datadog.versionFileRelativeUrl}version.json`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
      })
      .pipe(map(({ version }) => version));
  }
  /**
   * Datadogブラウザログの初期化
   */
  public init() {
    if (this._isDisableDatadog) {
      return;
    }
    this._subscription.add(
      this.version$
        .pipe(
          take(1),
          map(
            (version: string) =>
              ({
                clientToken: this._config.clientToken,
                site: this._config.site,
                service: this._config.service,
                env: this._config.env,
                version,
              } as LogsInitConfiguration)
          )
        )
        .subscribe((config: LogsInitConfiguration) => {
          datadogLogs.init(config);
        })
    );
  }

  /**
   * ログ出力（info）
   *
   * @param logType ログ種類
   * @param sendMsg ログ種類ごとに出力するログ内容
   * @param maskFlg ログのマスク要否（デフォルト：false(マスク不要)）
   */
  public info(logType: LogType, sendMsg: LogCustomMsg, maskFlg?: boolean) {
    this._logCommon(LogLevel.INFO, logType, sendMsg, maskFlg);
  }

  /**
   * ログ出力（warn）
   *
   * @param logType ログ種類
   * @param sendMsg ログ種類ごとに出力するログ内容
   * @param maskFlg ログのマスク要否（デフォルト：false(マスク不要)）
   */
  public warn(logType: LogType, sendMsg: LogCustomMsg, maskFlg?: boolean) {
    this._logCommon(LogLevel.WARN, logType, sendMsg, maskFlg);
  }

  /**
   * ログ出力（error）
   *
   * @param logType ログ種類
   * @param sendMsg ログ種類ごとに出力するログ内容
   * @param maskFlg ログのマスク要否（デフォルト：false(マスク不要)）
   */
  public error(logType: LogType, sendMsg: LogCustomMsg, maskFlg?: boolean) {
    this._logCommon(LogLevel.ERROR, logType, sendMsg, maskFlg);
  }

  /**
   * ログ出力（debug）
   *
   * @param logType ログ種類
   * @param sendMsg ログ種類ごとに出力するログ内容
   * @param maskFlg ログのマスク要否（デフォルト：false(マスク不要)）
   */
  public debug(logType: LogType, sendMsg: LogCustomMsg, maskFlg?: boolean) {
    // 本番環境の場合処理をスキップ
    if (this._isProductionEnv) {
      return;
    }
    this._logCommon(LogLevel.DEBUG, logType, sendMsg, maskFlg);
  }

  /**
   * 運用確認ログの出力
   *
   * @param msgId 運用確認ログに出力するメッセージのメッセージID
   * @param msgParams 運用確認ログに出力するメッセージ内の埋め込み文字列置換用情報
   * @param sendMsg ログ出力内容
   */
  public operationConfirmLog(msgId: string, msgParams?: OperationConfirmLogMsgParams, sendMsg?: LogCustomMsg) {
    const aswContextSvc: AswContextStoreService = this._injector.get(AswContextStoreService);
    const aswServiceSvc: AswServiceStoreService = this._injector.get(AswServiceStoreService);
    const aswMasterSvc: AswMasterService = this._injector.get(AswMasterService);

    // 操作オフィスコード、POS国コード、言語情報
    const { pointOfSaleId, posCountryCode, lang } = aswContextSvc.aswContextData;
    // 予約番号
    const orderId = aswServiceSvc.aswServiceData.orderId;

    this._subscription.add(
      aswMasterSvc
        .getAswMasterByKey$(MasterStoreKey.OPERATION_CONFIRM_LOG)
        .pipe(take(1))
        .subscribe((master) => {
          // 運用確認ログのメッセージ取得
          let message = master[msgId]?.[0]?.['message'] || '';

          // 運用確認ログメッセージ内の埋め込み情報置換
          if (msgParams) {
            if (message) {
              Object.keys(msgParams).forEach((msgParamKey) => {
                let replaceKey = '{' + msgParamKey + '}';
                message = message.replace(replaceKey, msgParams[msgParamKey]);
                return message;
              });
            } else {
              Object.keys(msgParams).forEach((msgParamKey) => {
                let replaceValue = msgParams[msgParamKey];
                message += '{' + replaceValue + '}';
                return message;
              });
            }
          }
          let operationConfirmLog: LogCustomMsg = {
            pointOfSaleId,
            posCountryCode,
            lang,
            orderId,
            messageId: msgId,
            message,
            errorDetailsInfo: sendMsg,
          };
          this.warn(LogType.OPERATION_CONFIRM, operationConfirmLog, false);
        })
    );
  }

  /**
   * ログ出力（指定外のログ種類・任意のログ内容を出力する場合）
   *
   * @param status ログステータス（ログ出力レベル）
   * @param logType ログ種類
   * @param sendMsg ログ内容（任意）
   */
  public log(status: LogLevel, logType: string, sendMsg?: object) {
    datadogLogs.logger.log(logType, sendMsg, status);
  }

  public ngOnDestroy() {
    this._subscription.unsubscribe();
  }

  /**
   * ログ出力の共通処理
   *
   * @param status ログステータス（ログ出力レベル）
   * @param logType ログ種類
   * @param sendCustom ログ内容
   * @param maskFlg ログのマスク要否（デフォルト：false(マスク不要)）
   */
  private _logCommon(status: LogLevel, logType: LogType, sendCustom: LogCustomMsg, maskFlg?: boolean) {
    // ASWユーザID
    const aswUserId = sessionStorage.getItem(SessionStorageName.IDENTIFICATION_ID) || '';
    // 機能画面ID
    const aswCommonSvc: AswCommonStoreService = this._injector.get(AswCommonStoreService);
    const funcPageId = `${aswCommonSvc.getFunctionId()}_${aswCommonSvc.getPageId()}`;

    // ログマスクが必要な場合、ログのマスク処理を行う
    if (maskFlg) {
      sendCustom = this._logMask(sendCustom);
    }
    // ログ送信内容定義
    const logToSend = {
      details: {
        common: {
          identificationId: aswUserId,
          functionId_pageId: funcPageId,
        },
        // ログ種類ごとに送信するログ内容
        ...sendCustom,
      },
    };

    if (!this._isDisableDatadog) {
      datadogLogs.logger.log(logType, logToSend, status);
    }
  }

  /**
   * ログのマスク
   *
   * @param input マスク対象
   * @returns マスク済みログ
   */
  private _logMask(input: LogCustomMsg): LogCustomMsg {
    // ログマスク対象置換ルール（デフォルト）
    let replaceRules = logDefReplaceRules;
    // カスタムの置換ルールがある場合ルールをマージ
    if (this._config.replaceRules) {
      replaceRules = { ...replaceRules, ...this._config.replaceRules };
    }
    // 置換方法の定義
    const strReplace = (k: string, str: string) => {
      return str ? str.replace(new RegExp(replaceRules[k][0], 'g'), replaceRules[k][1]) : str;
    };
    // マスク対象のマスク処理（文字列置換）の定義
    const mask = (input: any): any => {
      if (typeof input === 'string') {
        return input;
      }
      if (Array.isArray(input)) {
        return input.map((v) => mask(v));
      }
      if (input && typeof input === 'object') {
        return Object.fromEntries(
          Object.entries(input).map(([k, v]) => [k, k in replaceRules ? strReplace(k as string, v as string) : mask(v)])
        );
      }
      return input;
    };
    // マスク処理（文字列置換）したあとのログを返却
    return mask(input);
  }

  /**
   * Datadog接続制御用環境変数
   * - true: Datadog連携しない／false: Datadog連携する
   */
  private get _isDisableDatadog(): boolean {
    return environment.datadog.disable;
  }

  /**
   * 本番環境判定用環境変数
   * - true: 本番環境／false: 本番環境でない
   */
  private get _isProductionEnv(): boolean {
    return environment.envName === 'prd';
  }
}
