import { CamelToSnake } from './camel-to-snake';
import { SnakeToCamelCase } from './snake-to-camel';

export type AlertType = (typeof AlertType)[keyof typeof AlertType];
export const AlertType = {
  ERROR: 0,
  WARNING: 1,
  INFOMATION: 2,
} as const;

/**
 * @param contentHtml innnerHtmlになる部分
 * @param isCloseEnable 閉じるボタンの表示判定
 * @param type クラスの設定のためエラー、ワーニング、インフォメーションの識別
 * @param interpolateParams translateに渡す引数
 * @param displayKey　画面に表示するエラーキー　空の場合非表示（WARNINGかつエラーメッセージIDがある場合は自動設定）
 * @param errorMessageId　エラーメッセージID　設定した場合自動でエラーキーが表示される
 * @param apiErrorCode　APIエラーコード　エラーメッセージIDとともに設定した場合表示される
 * @param contentId 注意喚起エリアの管理用ID、設定しないこと
 * @param isClosed 注意喚起エリアの管理用変数、設定しないこと
 */
export interface AlertMessageItem {
  contentHtml: string;
  isCloseEnable: boolean;
  alertType?: AlertType;
  interpolateParams?: Object;
  displayKey?: string;
  errorMessageId?: string;
  apiErrorCode?: string;
  contentId?: string;
  isClosed?: boolean;
}

/**
 * キーリスト @see {@link AlertMessageItem}
 * インターフェイスのキー かつ キー = valueの定義
 */
export type AlertMessageItemType = (typeof AlertMessageItemType)[keyof typeof AlertMessageItemType];
export const AlertMessageItemType: {
  [key in Uppercase<keyof Required<CamelToSnake<AlertMessageItem>>>]: SnakeToCamelCase<Lowercase<key>> &
    keyof AlertMessageItem;
} = {
  CONTENT_HTML: 'contentHtml',
  IS_CLOSE_ENABLE: 'isCloseEnable',
  ALERT_TYPE: 'alertType',
  INTERPOLATE_PARAMS: 'interpolateParams',
  DISPLAY_KEY: 'displayKey',
  ERROR_MESSAGE_ID: 'errorMessageId',
  API_ERROR_CODE: 'apiErrorCode',
  CONTENT_ID: 'contentId',
  IS_CLOSED: 'isClosed',
};
