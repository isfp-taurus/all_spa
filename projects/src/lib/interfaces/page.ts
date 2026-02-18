/**
 * 画面タイプ
 */
export type PageType = (typeof PageType)[keyof typeof PageType];
export const PageType = {
  PAGE: 'page',
  SUBPAGE: 'subPage',
} as const;
