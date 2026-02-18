/**
 * モバイル端末種別
 *
 * @param IPHONE iPhone
 * @param IPOD iPod
 * @param IPAD iPad
 * @param ANDROID android
 * @param UNKNOWN 不明
 *
 */
export type MobileDeviceType = (typeof MobileDeviceType)[keyof typeof MobileDeviceType];
export const MobileDeviceType = {
  IPHONE: 'iPhone',
  IPOD: 'iPod',
  IPAD: 'iPad',
  ANDROID: 'Android',
  UNKNOWN: 'UNKNOWN',
} as const;
