/**
 * iFly電話番号種別
 *
 * @param HOME_PHONE 自宅
 * @param HOME_MOBILE 自宅携帯
 * @param BUSINESS_PHONE 勤務先
 * @param BUSINESS_MOBILE 勤務先携帯
 * @param UNKNOWN 不明
 *
 */
export type IFlyPhoneNumberType = (typeof IFlyPhoneNumberType)[keyof typeof IFlyPhoneNumberType];
export const IFlyPhoneNumberType = {
  HOME_PHONE: 'HP',
  HOME_MOBILE: 'HM',
  BUSINESS_PHONE: 'BP',
  BUSINESS_MOBILE: 'BM',
  UNKNOWN: '',
} as const;
