import { ReplaceParam } from './translate';

/**
 * エラータイプ
 * - businessLogic: ビジネスロジックエラー
 * - system: システムエラー
 * - sessionTimeout: セッションタイムアウトエラー
 */
export type ErrorType = (typeof ErrorType)[keyof typeof ErrorType];
export const ErrorType = {
  BUSINESS_LOGIC: 'businessLogic',
  SYSTEM: 'system',
  SESSION_TIMEOUT: 'sessionTimeout',
} as const;

/**
 * エラー画面のRoutes
 * - service-error: 共通エラー画面
 * - system-error: システムエラー画面
 * - session-timeout-error: セッションタイムアウトエラー画面
 * - browser-back-error: ブラウザバックエラー画面
 */
export const ErrorPageRoutes = {
  SERVICE: 'service-error',
  SYSTEM: 'system-error',
  SESSION_TIMEOUT: 'session-timeout-error',
  BROWSER_BACK: 'browser-back-error',
} as const;

/**
 * 継続不可能エラー情報Store Model
 */
export interface NotRetryableErrorModel extends ErrorCommonInfo {
  /** エラータイプ */
  errorType: ErrorType;
  /** 共通エラー画面の「確認ボタン」の遷移先URL */
  routingPath?: string;
  /**
   * ポップアップ表示判定フラグ
   * ※ポップアップ表示時に指定する必要がある（エラー発生有無問わず）
   * - true: ポップアップ表示
   * - false: ポップアップ表示でない
   */
  isPopupPage?: boolean;
}

/**
 * 継続可能エラー情報Store用のType
 */
export interface RetryableError extends ErrorCommonInfo {}

/**
 * 継続不可能/継続可能エラー共通情報
 */
export interface ErrorCommonInfo {
  /**
   * エラーメッセージID
   * - ※エラータイプがビジネスロジックエラーの場合は必須
   */
  errorMsgId?: string;
  /**
   * APIエラーコード
   * - ※APIによるエラーの場合は必須
   */
  apiErrorCode?: string;
  /** 埋め込み用情報（複数指定可能） */
  params?: ReplaceParam | ReplaceParam[];
}
