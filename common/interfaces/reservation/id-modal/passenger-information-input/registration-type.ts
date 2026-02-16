/**
 * 登録状況
 * @param REGISTERED 登録済み
 * @param NOT_REGISTERED 未登録
 * @param EDITTING 編集中
 */
export type RegistrationLabelType = (typeof RegistrationLabelType)[keyof typeof RegistrationLabelType];
export const RegistrationLabelType = {
  REGISTERED: 'label.registered1',
  NOT_REGISTERED: 'label.notRegistered.passengerInput',
  EDITTING: 'label.editing',
} as const;
