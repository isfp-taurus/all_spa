/**
 * 会員種別
 *
 * @param MEMBER_ACH ACH会員
 * @param MEMBER_AID AID会員
 * @param MEMBER_TMP AID会員(TMP)
 * @param UNKNOWN 不明
 *
 */
export type MemberKindCodeType = (typeof MemberKindCodeType)[keyof typeof MemberKindCodeType];
export const MemberKindCodeType = {
  MEMBER_ACH: 'ACH',
  MEMBER_AID: 'AID',
  MEMBER_TMP: 'TMP',
  UNKNOWN: '',
} as const;
