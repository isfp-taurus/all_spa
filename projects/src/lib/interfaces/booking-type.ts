/**
 * 有償特典種別
 *
 * @param R 有償
 * @param A 特典
 *
 */
export type BookingType = (typeof BookingType)[keyof typeof BookingType];
export const BookingType = {
  R: 'R',
  A: 'A',
  UNKNOWN: '',
} as const;
