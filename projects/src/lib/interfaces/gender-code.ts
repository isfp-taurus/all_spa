/**
 * 会員種別
 *
 * @param MALE 男性
 * @param FEMALE 女性
 * @param UNKNOWN 不明
 *
 */
export type GenderCodeType = (typeof GenderCodeType)[keyof typeof GenderCodeType];
export const GenderCodeType = {
  MALE: 'male',
  FEMALE: 'female',
  UNKNOWN: '',
} as const;
