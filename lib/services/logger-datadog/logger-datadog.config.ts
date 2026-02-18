import { InjectionToken } from '@angular/core';
import { environment } from '@env/environment';
import { LogReplaceRules } from '../../interfaces';

export const DATADOG_LOGS_TOKEN = new InjectionToken<Partial<DataDogCustomConfig>>('datadog injection token');

/**
 * Datadogログ構成（カスタム用）
 */
export interface DataDogCustomConfig {
  /**
   * アプリケーションのサービス名
   * - フォーマット：all:spa:{アプリケーション名}
   * @example <caption>アプリケーションに応じて下記のように指定</caption>
   * all:spa:reservation
   * all:spa:servicing
   * all:spa:exchange
   * all:spa:checkin
   */
  service: string;
  /**
   * ログマスク対象の置換ルール
   * - デフォルトルール{@link logDefReplaceRules}以外に追加でルールを指定する場合
   * @type {?LogReplaceRules} {@link LogReplaceRules}
   */
  replaceRules?: LogReplaceRules;
}

/**
 * ログマスク対象置換ルール（デフォルト）
 */
export const logDefReplaceRules: LogReplaceRules = {
  // クレジットカード番号：末尾4桁以外をマスクする
  cardNumber: ['.(?=(.{4}))', '*'],
  // セキュリティコード：全桁をマスクする
  cvv: ['\\d', '*'],
  // ログインパスワード：全桁をマスクする
  customerPassword: ['\\d', '*'],
};

/**
 * Datadogログ構成（デフォルト）
 * - DatadogブラウザーSDK構成の詳細は公式を参照
 * {@link https://docs.datadoghq.com/ja/logs/log_collection/javascript/}
 */
export const datadogDefConfig = {
  clientToken: environment.datadog.clientToken,
  site: 'datadoghq.com',
  service: 'all:spa:default',
  env: environment.datadog.env,
};

/**
 * Datadogログ構成（デフォルト）
 */
type DatadogDefConfig = typeof datadogDefConfig;

/**
 * Datadogログ構成
 * @extends {DataDogCustomConfig}
 * @extends {DatadogDefConfig}
 */
export interface DataDogConfig extends DataDogCustomConfig, DatadogDefConfig {}
