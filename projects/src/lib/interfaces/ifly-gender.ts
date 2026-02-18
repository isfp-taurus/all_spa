/**
 * iFly性別種別
 *
 * @param MALE 男性
 * @param FEMALE 女性
 * @param UNSPECIFIED 指定しない
 * @param UNDISCLOSED 公開しない
 * @param UNKNOWN 不明
 *
 */
export type IFlyGenderType = (typeof IFlyGenderType)[keyof typeof IFlyGenderType];
export const IFlyGenderType = {
  MALE: 'M',
  FEMALE: 'F',
  UNSPECIFIED: 'X',
  UNDISCLOSED: 'U',
  UNKNOWN: '',
} as const;
