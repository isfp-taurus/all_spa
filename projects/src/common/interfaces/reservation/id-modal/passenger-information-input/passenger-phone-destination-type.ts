/**
 * 電話番号送信種別
 * @param REPRESENTATIVE　代表者に送る
 * @param INDIVIDUAL　個人に送る
 * @param NOT_SEND　送信しない
 */
export type PassengerPhoneDestinationType =
  (typeof PassengerPhoneDestinationType)[keyof typeof PassengerPhoneDestinationType];
export const PassengerPhoneDestinationType = {
  REPRESENTATIVE: '0',
  INDIVIDUAL: '1',
  NOT_SEND: '2',
  UNKNOWN: '',
} as const;
