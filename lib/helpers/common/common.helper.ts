import { breakpointPc, breakpointSp, breakpointTb } from '../../interfaces';
import { v4 } from 'uuid';

/**
 * 一意のIDを作成する
 */
export function uniqueId(): string {
  return v4();
}

// 端末識別
export function isPC(): boolean {
  return window.matchMedia('(min-width: ' + breakpointPc + 'px)').matches;
}
export function isTB(): boolean {
  return window.matchMedia('(min-width: ' + breakpointTb + 'px)').matches && !isPC();
}
export function isSP(): boolean {
  return window.matchMedia('(max-width: ' + breakpointSp + 'px)').matches;
}

// オブジェクトの配列は指定したパラメータでソートする
export function parameterSort<T, K extends keyof T>(data: T[], key: K) {
  return data.sort((n1, n2) => {
    //if(!(key in n1) && !(key in n2)){ //keyがあるか判定 必要なら追加
    //return 0;
    //}
    if (n1[key] > n2[key]) {
      return 1;
    }
    if (n1[key] < n2[key]) {
      return -1;
    }
    return 0;
  });
}

/**
 * Fingerprints.jsから該当URLファイルのバージョンを取得
 *
 * @param url 対象のURL
 * @returns
 */
export function getFingerprintsVersion(url: string): string {
  const version = (window as any).Asw?.Fingerprints?.[url.slice(1)];
  if (version) {
    return version;
  }
  return '';
}

/**
 * 要素が可視化されているかどうかを判定する
 * 要素を隠す場合に使用されるクラス名をtargetStylesに指定
 * @param element 判定対象となる要素
 * @returns 可視化されているかのboolean
 */
export function isVisible(element: any): boolean {
  if (!element) {
    return false;
  }

  const style = window.getComputedStyle(element);
  const targetstyles = ['.u-visually-hidden', '.visuallyHidden'];

  return (
    style.display !== 'none' &&
    style.visibility !== 'hidden' &&
    style.opacity !== '0' &&
    element.offsetWidth > 0 &&
    element.offsetHeight > 0 &&
    targetstyles.every((target) => !element.classList.contains(target))
  );
}
