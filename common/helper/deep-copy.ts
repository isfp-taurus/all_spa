/**
 * オブジェクトをディープコピーする
 * @param obj コピーするオブジェクト
 * @returns 戻り値 コピーしたオブジェクト
 */
export function deepCopy<T extends {}>(obj: T): T {
  const newObj: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== null && value !== undefined && typeof value === 'object') {
      if (Array.isArray(value)) {
        newObj[key as keyof T] = deepCopyArray(value);
      } else {
        newObj[key as keyof T] = { ...deepCopy(value) };
      }
    } else {
      newObj[key as keyof T] = value;
    }
  }
  return newObj as T;
}
/**
 * 配列をディープコピーする
 * @param obj コピーする配列
 * @returns 戻り値 コピーした配列
 */
export function deepCopyArray<T>(array: Array<T>): Array<T> {
  return array.map((data) => {
    if (Array.isArray(data)) {
      return deepCopyArray(data) as unknown as T;
    } else if (typeof data === 'object') {
      return deepCopy(data as unknown as object) as unknown as T;
    }
    return data;
  });
}
