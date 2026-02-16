/**
 * 搭乗者情報入力　リクエスト時の編集中パラメータ定義 ※各搭乗者の場合は配列indexが番号になる
 * @param NOT_EDITTING 未編集
 * @param REPRESENTATIVE 代表者情報編集
 * @param EDITTING 滞在先情報編集
 */
export type PassengerInformationRequestEditType =
  (typeof PassengerInformationRequestEditType)[keyof typeof PassengerInformationRequestEditType];
export const PassengerInformationRequestEditType = {
  NOT_EDITTING: -99,
  REPRESENTATIVE: -1,
  DURING_STAY: -2,
} as const;
