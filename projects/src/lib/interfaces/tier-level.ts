/**
 * TierLevel
 *
 * @param DABC Diamond A/B/C
 * @param PLT Platinum
 * @param SFC Super Flyers Card
 * @param BRZ Bronze
 * @param ACH ANA Card Holder
 * @param AID ANA ID Card/TMP Card
 * @param UNKNOWN 不明
 *
 */
export type TierLevelType = (typeof TierLevelType)[keyof typeof TierLevelType];
export const TierLevelType = {
  DABC: 'DBC',
  PLT: 'PLT',
  SFC: 'SFC',
  BRZ: 'BRZ',
  ACH: 'ACH',
  AID: 'AID',
  UNKNOWN: '',
} as const;
