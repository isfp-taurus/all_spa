/**
 * プレミアムステータス
 *
 * @param DIAMOND ダイアモンド会員
 * @param PLATINUM プラチナ会員
 * @param BRONZE ブロンズ会員
 * @param UNKNOWN 不明
 *
 */
export type PremiumStatusCodeType = (typeof PremiumStatusCodeType)[keyof typeof PremiumStatusCodeType];
export const PremiumStatusCodeType = {
  DIAMOND: 'DIA',
  PLATINUM: 'PLT',
  BRONZE: 'BRZ',
  UNKNOWN: '',
} as const;
