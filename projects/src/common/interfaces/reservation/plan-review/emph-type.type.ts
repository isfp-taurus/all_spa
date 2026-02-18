/**
 * 差分強調表示種別
 */
export type EmphType = (typeof EmphType)[keyof typeof EmphType];
export const EmphType = {
  NL: 'nl', // 通常表示
  DEL: 'del', // 取り消し線表示
  DIFF: 'diff', // 差分表示
} as const;
