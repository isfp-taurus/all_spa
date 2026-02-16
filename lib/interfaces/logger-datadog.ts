/** ログステータス（ログ出力レベル） */
export type LogLevel = (typeof LogLevel)[keyof typeof LogLevel];
export const LogLevel = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
} as const;

/**
 * ログ種類
 * - pageViewEvent: PageViewEventログ
 * - apiIf: API I/Fログ
 * - operationConfirm: 運用確認ログ
 * - event: Eventログ
 */
export type LogType = (typeof LogType)[keyof typeof LogType];
export const LogType = {
  // PageViewEventログ
  PAGE_VIEW: 'pageViewEvent',
  // API I/Fログ
  API_IF: 'apiIf',
  // 運用確認ログ
  OPERATION_CONFIRM: 'operationConfirm',
  // Eventログ
  EVENT: 'event',
} as const;

/**
 * ログ出力メッセージ（共通項目）
 */
export interface LogCommonMsg {
  /** ASWユーザID */
  identificationId: string;
  /** 機能ID_画面ID */
  functionId_pageId: string;
}

/**
 * ログ出力メッセージ（ログ種類ごとに個別で出力する項目用）
 */
export interface LogCustomMsg {
  [msgKey: string]: any;
}

/**
 * ログマスク対象置換ルール
 * - key: マスク対象文字
 * - value: [置換対象(正規表現), 置換文字列]
 * @example
 * // "maskTarget"項目に対して、全桁をマスクする場合
 * maskTarget: ['.', '*']
 */
export interface LogReplaceRules {
  [maskTarget: string]: [string, string];
}

/**
 * 運用確認ログメッセージ内の埋め込み文字列置換用情報
 */
export interface OperationConfirmLogMsgParams {
  [msgReplaceParam: string | number]: string;
}
