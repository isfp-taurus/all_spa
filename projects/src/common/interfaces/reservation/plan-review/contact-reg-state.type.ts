/**
 * 連絡先登録状況
 */
export type ContactRegState = (typeof ContactRegState)[keyof typeof ContactRegState];
export const ContactRegState = {
  SAME_AS_REP: 'sameAsRep', // 代表者連絡先と同じ
  INDIV: 'indiv', // 個別指定
  NOT_NEEDED: 'notNeeded', // 送信不要
  UNREG: 'unreg', // 未登録
} as const;
