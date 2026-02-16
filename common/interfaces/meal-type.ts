/**
 * 機内食種別
 *
 * @param SPECIAL 特別機機内食
 * @param ANCILLARY 有料機内食
 * @param PREORDER 事前オーダー
 * @param UNKNOWN 不明
 *
 */
export type MealType = (typeof MealType)[keyof typeof MealType];
export const MealType = {
  SPECIAL: 'special',
  ANCILLARY: 'ancillary',
  PREORDER: 'preOrder',
  UNKNOWN: '',
} as const;
