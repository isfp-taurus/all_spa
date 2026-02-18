/**
 * 第2連絡先種別
 * @param FIRST_TRAVELER 1人目と同じ
 * @param INDIVIDUAL　個人に送る
 * @param AFTER_REGISTER　後で登録する
 */
export type PassengerSecondContactType = (typeof PassengerSecondContactType)[keyof typeof PassengerSecondContactType];
export const PassengerSecondContactType = {
  FIRST_TRAVELER: '0',
  INDIVIDUAL: '1',
  AFTER_REGISTER: '2',
} as const;
