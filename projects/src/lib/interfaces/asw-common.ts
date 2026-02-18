/**
 * AswCommon Store Model
 */

import { CamelToSnake } from './camel-to-snake';
import { SnakeToCamelCase } from './snake-to-camel';

/**
 * 画面情報
 * @param funcId 機能ID
 * @param pageId ページID
 * @param subFuncId サブ機能ID
 * @param subPageId サブページID
 * @param isEnabledLogin ログイン可能フラグ
 * @param isUpgrade アップグレードフラグ
 * @param beforeLoginEvent ログイン前の処理
 */
export interface AswCommonModel {
  functionId?: string;
  subFunctionId?: string;
  pageId?: string;
  subPageId?: string;
  isEnabledLogin?: boolean;
  isUpgrade?: boolean;
  beforeLoginEvent?: () => void;
}

/**
 * キーリスト　@see {@link AswCommonModel}
 * インターフェイスのキー かつ キー = valueの定義
 */

export type AswCommonType = (typeof AswCommonType)[keyof typeof AswCommonType];
export const AswCommonType: {
  [key in Uppercase<keyof Required<CamelToSnake<AswCommonModel>>>]: SnakeToCamelCase<Lowercase<key>> &
    keyof AswCommonModel;
} = {
  FUNCTION_ID: 'functionId',
  SUB_FUNCTION_ID: 'subFunctionId',
  PAGE_ID: 'pageId',
  SUB_PAGE_ID: 'subPageId',
  IS_ENABLED_LOGIN: 'isEnabledLogin',
  IS_UPGRADE: 'isUpgrade',
  BEFORE_LOGIN_EVENT: 'beforeLoginEvent',
};
