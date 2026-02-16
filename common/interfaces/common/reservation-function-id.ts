/**
 * 新規予約　機能ID
 * @param PRIME_BOOKING 新規予約
 * @param LOGIN ログイン
 */
export type ReservationFunctionIdType = (typeof ReservationFunctionIdType)[keyof typeof ReservationFunctionIdType];
export const ReservationFunctionIdType = {
  PRIME_BOOKING: 'R01',
  LOGIN: 'R02',
} as const;
