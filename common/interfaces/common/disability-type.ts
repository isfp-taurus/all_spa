/**
 * 障がい者種別
 *
 * @param GRADE1 障がい一種
 * @param GRADE2 障がい二種
 * @param MENTAL 精神障がい
 * @param CREGIVER 介護者
 * @param UNKNOWN 不明
 *
 */
export type DisabilityType = (typeof DisabilityType)[keyof typeof DisabilityType];
export const DisabilityType = {
  GRADE1: 'grade1',
  GRADE2: 'grade2',
  MENTAL: 'mentalDisability',
  CREGIVER: 'caregiver',
  UNKNOWN: '',
} as const;
