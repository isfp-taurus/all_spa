/**
 * iFlyアドレス種別
 *
 * @param Home 自宅
 * @param BUSINESS 勤務先
 * @param UNKNOWN 不明
 *
 */
export type IFlyAddressType = (typeof IFlyAddressType)[keyof typeof IFlyAddressType];
export const IFlyAddressType = {
  HOME: 'H',
  BUSINESS: 'B',
  UNKNOWN: '',
} as const;
