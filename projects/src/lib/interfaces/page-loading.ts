/**
 * ローディング画面表示制御用Store Model
 */
export interface PageLoadingModel {
  /**
   * ローディング表示フラグ
   * - true：ローディング中である
   * - false：ローディング中でない
   */
  isLoading?: boolean;
  /**
   * ローディング画面の表示モード
   * @see {@link LoadingDisplayMode}
   */
  loadingDisplayMode: LoadingDisplayMode;
}

/**
 * ローディング画面表示制御用Store ModelのType
 *
 * @see {@link PageLoadingModel}
 */
export type PageLoadingType = keyof PageLoadingModel;

/**
 * ローディング画面の表示モード
 * - normal: 通常モード
 * - promotion: プロモーションモード
 */
export type LoadingDisplayMode = (typeof LoadingDisplayMode)[keyof typeof LoadingDisplayMode];
export const LoadingDisplayMode = {
  /** 通常モード */
  NORMAL: 'normal',
  /** プロモーションモード */
  PROMOTION: 'promotion',
} as const;
