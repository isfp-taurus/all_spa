/**
 * サービス種別
 */
export type AncillarySvcType = (typeof AncillarySvcType)[keyof typeof AncillarySvcType];
export const AncillarySvcType = {
  FBAG: 'fBag', // 事前追加手荷物
  LOUG: 'loug', // ラウンジ
  MEAL: 'meal', // 機内食
  PET: 'pet', // ペットらくのり
} as const;
