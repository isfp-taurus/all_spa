/**
 * 現行ASWへのリンク出力
 * @param url リンクURL
 * @param lang 言語
 * @param identificationId ASWユーザID
 * @returns リンクURL
 */
export function transform(url: string, lang: string, identificationId: string): string {
  return `${url}${
    url.indexOf('?') === -1 ? '?' : '&'
  }CONNECTION_KIND=ZZZ&LANG=${lang}&identificationId=${identificationId}`;
}
