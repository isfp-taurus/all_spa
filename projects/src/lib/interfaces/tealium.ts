/**
 * Tealium連携用情報
 */
export interface TealiumData {
  /** Tealium連携用グローバル変数名のキー */
  key: TealiumDataKey;
  /** Tealium連携用グローバル変数の値（key:value形式の塊として指定する） */
  value: object;
}

/**
 * Tealium連携用グローバル変数名のキー
 * - BaseOutput： 基本情報JSON
 * - PageOutput：画面情報JSON
 * - ApiReplyOutput：API応答JSON
 */
export type TealiumDataKey = (typeof TealiumDataKey)[keyof typeof TealiumDataKey];
export const TealiumDataKey = {
  BASE_OUTPUT: 'BaseOutput',
  PAGE_OUTPUT: 'PageOutput',
  API_REPLY_OUTPUT: 'ApiReplyOutput',
} as const;

/**
 * Tealium用グローバル変数への格納モード
 * - set：上書きモード（デフォルト値）
 *   - グローバル変数名に値をそのまま格納する（変数名が存在する場合の値は上書きされる）
 * - add：追加モード
 *   - グローバル変数の値のkeyが存在する場合は新しいvalueで上書きし、存在しない場合は新たなkey:valueを追加する
 */
export type TealiumMode = (typeof TealiumMode)[keyof typeof TealiumMode];
export const TealiumMode = {
  SET: 'set',
  ADD: 'add',
} as const;
