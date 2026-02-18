/**
 * 端末種別
 *
 * @param PC PC
 * @param TABLET タブレット
 * @param SMART_PHONE スマートフォン
 * @param UNKNOWN 不明
 *
 */
export type DeviceType = (typeof DeviceType)[keyof typeof DeviceType];
export const DeviceType = {
  PC: 'PC',
  TABLET: 'TAB',
  SMART_PHONE: 'SP',
  UNKNOWN: '',
} as const;
