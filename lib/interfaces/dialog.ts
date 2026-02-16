import { ReplaceParam } from './translate';

/**
 * 確認ダイアログの情報
 */
export interface DialogInfo {
  /**
   * ダイアログのパターン
   * @see {@link DialogType}
   */
  type?: DialogType;
  /**
   * ダイアログのサイズ
   * @see {@link DialogType}
   */
  size?: DialogSize;
  /** ダイアログのメッセージID */
  message: string;
  /**
   * ダイアログメッセージ内の埋め込み用情報（複数指定可能）
   * @see {@link ReplaceParam}
   */
  messageParams?: ReplaceParam | ReplaceParam[];
  /**
   * 確定ボタンの表示ラベル（カスタムの場合のみ）
   * - ※指定する際は、文言キーで指定
   */
  confirmBtnLabel?: string;
  /**
   * キャンセルボタンの表示ラベル（カスタムの場合のみ）
   * - ※指定する際は、文言キーで指定
   */
  closeBtnLabel?: string;
}

/**
 * 確認ダイアログのパターン
 * - choice: 選択ダイアログ（デフォルト）
 * - warn: 警告ダイアログ
 */
export type DialogType = (typeof DialogType)[keyof typeof DialogType];
export const DialogType = {
  CHOICE: 'choice',
  WARN: 'warn',
} as const;

/**
 * 確認ダイアログのサイズ（デフォルト: small）
 */
export type DialogSize = (typeof DialogSize)[keyof typeof DialogSize];
export const DialogSize = {
  L: 'large',
  S: 'small',
} as const;

/**
 * 確認ダイアログボタン押下時のボタンタイプ
 * - confirm: 確定ボタン
 * - close: キャンセルボタン
 */
export type DialogClickType = (typeof DialogClickType)[keyof typeof DialogClickType];
export const DialogClickType = {
  CONFIRM: 'confirm',
  CLOSE: 'close',
} as const;
