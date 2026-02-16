/**
 * Browser種別
 *
 * @param FIREFOX FireFox
 * @param CHROME Chrome
 * @param SAFARI Safari
 * @param IE IE
 * @param UNKNOWN 不明
 *
 */
export type BrowserType = (typeof BrowserType)[keyof typeof BrowserType];
export const BrowserType = {
  FIREFOX: 'FireFox',
  CHROME: 'Chrome',
  SAFARI: 'Safari',
  IE: 'IE',
  UNKNOWN: '',
} as const;
