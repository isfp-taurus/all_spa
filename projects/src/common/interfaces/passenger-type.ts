/**
 * 搭乗者種別
 *
 * @param ADT 大人
 * @param B15 15歳以下
 * @param CHD 12歳以下
 * @param INF 幼児
 * @param INS 幼児（INS）
 * @param UNKNOWN 不明
 *
 */
export type PassengerType = (typeof PassengerType)[keyof typeof PassengerType];
export const PassengerType = {
  ADT: 'ADT',
  B15: 'B15',
  CHD: 'CHD',
  INF: 'INF',
  INS: 'INS',
  UNKNOWN: '',
} as const;
