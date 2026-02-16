import { GenderCodeType } from '@lib/interfaces';

/**
 * 表示用文言取得
 * @returns 表示用文言
 */
export function getNameStaticLabel(genderCode: string) {
  switch (genderCode) {
    case GenderCodeType.MALE:
      return 'label.male.title';
    case GenderCodeType.FEMALE:
      return 'label.female.title';
    default:
      return 'label.unknown.title';
  }
}

/**
 * 文字列が空文字もしくはundefined or nullの場合true
 * @param srt 文字列
 * @returns true\false
 */
export function isStringEmpty(str?: string): boolean {
  if (str === undefined || str === null || str === '') {
    return true;
  }
  return false;
}

/**
 * 文字列が空文字もしくはundefined or nullの場合デフォルト文字列を返す
 * @param srt 文字列
 * @param def デフォルト文字列
 * @returns 文字列
 */
export function stringEmptyDefault(str?: string, def: string = ''): string {
  return isStringEmpty(str) ? def : str ?? '';
}

/**
 * 文字列が空文字もしくはundefined or nullの場合undefinedを返す
 * @param srt 文字列
 * @returns 文字列
 */
export function stringEmptyUndefined(str?: string): string | undefined {
  return isStringEmpty(str) ? undefined : str ?? '';
}

/**
 * 0の場合undefinedを返す
 * @param num 値
 * @returns 値
 */
export function numberZeroUndefined(num?: number): number | undefined {
  return num === 0 ? undefined : num;
}

/**
 * オブジェクトのから判定
 * @param オブジェクト
 * @returns true/false
 */
export function isEmptyObject(obj?: object): boolean {
  return obj === undefined || Object.keys(obj).length === 0;
}
/**
 * 秒数をHH:mm:ssに変換
 * @param sec
 * @returns HH:mm:ss
 */
export function formatSeconds(sec: number | undefined): string | undefined {
  if (typeof sec !== 'undefined') {
    const hours = Math.floor(sec / 3600);
    const minutes = Math.floor((sec % 3600) / 60);
    const seconds = Math.floor(sec % 60);

    const hh = zeroPadding(hours, 2);
    const mm = zeroPadding(minutes, 2);
    const ss = zeroPadding(seconds, 2);

    return hh + ':' + mm + ':' + ss;
  } else {
    return;
  }
}

/**
 * ゼロパディング
 * @param num 対象のnumber
 * @param digits 0埋め後の桁数
 * @returns 0埋めした数値のstring
 */
export function zeroPadding(num: number, digits: number): string {
  let response = num.toString();
  for (let i = digits; i > 1; i--) {
    if (num < 10 ** (i - 1)) {
      response = '0' + response;
    } else {
      break;
    }
  }
  return response;
}

/**
 * 文字列からHTMLタグを除去
 * @param str
 * @returns HTMLタグを除去したstring
 */
export function deleteHtmlTags(str: string): string {
  return str.replace(/<("[^"]*"|'[^']*'|[^'">])*>/g, '');
}
