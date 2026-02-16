/**
 * 残席状況
 * 往復指定日空席照会(OWD)用APIが返却するデータ型
 * enough：十分空席あり available：空席あり few：残席実数 soldOut：売り切れ
 */
export type QuotaType = (typeof QuotaType)[keyof typeof QuotaType];
export const QuotaType = {
  ENOUGH: 'enough',
  AVAILABLE: 'available',
  FEW: 'few',
  SOLDOUT: 'soldOut',
} as const;
