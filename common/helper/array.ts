/**
 * 配列を指定した条件にて分割し二次元配列にした [シャローコピー](https://developer.mozilla.org/ja/docs/Glossary/Shallow_copy) を作成する。
 *
 * 下記は使用例。
 *
 * ```typescript
 * const originArray = [{ text: 'a' }, { text: 'b' }, { text: 'c' }, { text: 'd' }];
 * const splitted = splitArray(originArray, (value) => value.text === 'c');
 * console.log(splitted)
 * => [[{"text": "a"}, {"text": "b"}], [{"text": "d"}]]
 * ```
 *
 * @param originArray 元となる配列
 * @param separatorFunc 区切りとなる要素を指定するための条件
 * @returns 分割後の二次元配列
 */
export function splitArray<T>(originArray: T[], separatorFunc: (originArrayValue: T) => boolean) {
  const lastIndex = originArray.length - 1;
  const results: T[][] = [];
  let tmp: T[] = [];
  originArray.forEach((value, index) => {
    if (separatorFunc(value)) {
      results.push(tmp);
      tmp = new Array();
    } else {
      tmp.push(value);
      if (lastIndex === index) {
        results.push(tmp);
      }
    }
  });
  return results;
}

/**
 * 差集合を計算する関数
 */
export function differenceArray<T>(array1: T[], array2: T[]) {
  return array1.filter((val) => !array2.includes(val));
}
