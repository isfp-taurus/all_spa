/**
 * ＡＮＡカード種別コード
 *
 * @param REG：ANAカード
 * @param WID：ANAカードWIDE
 * @param SFC：ANAカードSFC
 * @param ANA：ANA社員カード
 * @param GRP：ANAグループカード
 * @param STU：ANAカード学生用
 * @param ZRO：ANAカードZERO
 *
 */
export type AnaCardTypeCodeType = (typeof AnaCardTypeCodeType)[keyof typeof AnaCardTypeCodeType];
export const AnaCardTypeCodeType = {
  REG: 'REG',
  WID: 'WID',
  SFC: 'SFC',
  ANA: 'ANA',
  GRP: 'GRP',
  STU: 'STU',
  ZRO: 'ZRO',
  UNKNOWN: '',
} as const;
