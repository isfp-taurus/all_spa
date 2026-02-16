/**
 * 差分強調表示種別
 */
export type TempUrlType = (typeof TempUrlType)[keyof typeof TempUrlType];
export const TempUrlType = {
  DPL: 'DPL', // Deeplink
  SHR: 'SHR', // シェア
  MIG: 'MIG', // 他端末移動
} as const;
