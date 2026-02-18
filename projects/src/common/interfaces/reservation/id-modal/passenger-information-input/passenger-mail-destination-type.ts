/**
 * メール、SMS送信種別
 * @param REPRESENTATIVE　代表者に送る
 * @param INDIVIDUAL　個人に送る
 * @param NOT_SEND　送信しない
 */
export type PassengerMailDestinationType =
  (typeof PassengerMailDestinationType)[keyof typeof PassengerMailDestinationType];
export const PassengerMailDestinationType = {
  REPRESENTATIVE: '0',
  INDIVIDUAL: '1',
  NOT_SEND: '2',
} as const;
