/**
 * 電話番号種別
 * @param NOME　自宅
 * @param MOBILE　携帯
 * @param BUSINESS　会社
 */
export type PhoneNumberType = (typeof PhoneNumberType)[keyof typeof PhoneNumberType];
export const PhoneNumberType = {
  NOME: 'H',
  MOBILE: 'M',
  BUSINESS: 'B',
} as const;
