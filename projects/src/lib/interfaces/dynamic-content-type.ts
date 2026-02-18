/**
 * 動的文言　メッセージタイプ
 *
 * @param  IMPOTANT_NOTICE_FIRST 重要なお知らせ（ファーストビュー）
 * @param  IMPOTANT_NOTICE 重要なお知らせ（シャッター）
 * @param  TIP_FOR_USE ご利用のヒント
 * @param  ALERT_INFOMATION 注意喚起エリア（インフォメーション）
 * @param  CONFIRM_DIALOG 確認ダイアログ
 * @param  ALERT_INFOMATION_NOT_CHANGE 注意喚起エリア（インフォメーション・種別変更不可)
 * @param  EMERGENCY 緊急案内エリア
 * @param  APPEAL_GUIDE 訴求案内エリア
 * @param  AGREEMENT 同意エリア
 *
 */
export type DynamicContentType = (typeof DynamicContentType)[keyof typeof DynamicContentType];
export const DynamicContentType = {
  IMPOTANT_NOTICE_FIRST: '1',
  IMPOTANT_NOTICE: '2',
  TIP_FOR_USE: '3',
  ALERT_INFOMATION: '4',
  CONFIRM_DIALOG: '5',
  ALERT_INFOMATION_NOT_CHANGE: '6',
  EMERGENCY: '9',
  APPEAL_GUIDE: '10',
  AGREEMENT: '11',
} as const;
