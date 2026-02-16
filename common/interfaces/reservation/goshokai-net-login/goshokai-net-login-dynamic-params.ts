/**
 * ご紹介ネット　動的文言パラメータ
 * @param isJapaneseSite 日本サイトかどうか
 */
export interface GoshokaiNetLoginDynamicParams {
  isJapaneseSite: boolean;
}
export function defaultGoshokaiNetLoginDynamicParams(): GoshokaiNetLoginDynamicParams {
  return {
    isJapaneseSite: false,
  };
}
