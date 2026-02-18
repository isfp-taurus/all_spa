import { formatDate } from '@angular/common';
import { convertStringToDate } from '@lib/helpers';

/**
 * 出発地点の年齢の計算
 * @param birth 誕生日文字列
 * @param birthdayFormat 誕生日フォーマット
 * @param departureDate 出発日文字列
 * @param departureFormat 出発日フォーマット
 * @returns 年齢
 */
export function getAgeOfSegment(
  birth: string,
  birthFormat: string,
  departureDate: string,
  departureFormat: string
): number {
  const birthday = new Date(dateFormat(birth, birthFormat));
  const departureDay = new Date(dateFormat(departureDate, departureFormat));
  let day = birthday.getDay();
  //うるう年考慮
  if (birthday.getDay() === 29 && birthday.getMonth() === 1) {
    if (departureDay.getDay() !== 29 || departureDay.getMonth() !== 1) {
      day = 28;
    }
  }
  let add = 0;

  const departureYear = new Date(departureDay.getFullYear(), birthday.getMonth(), birthday.getDay());
  if (departureDay.getMonth() < departureYear.getMonth()) {
    //出発日の月が誕生日未満
    add = -1;
  } else if (departureDay.getMonth() === departureYear.getMonth() && departureDay.getDay() < departureYear.getDay()) {
    //出発日の日にちが誕生日未満
    add = -1;
  }
  return departureDay.getFullYear() - birthday.getFullYear() + add;
}

export function dateFormat(data: any, format: string): string {
  try {
    if (typeof data === 'string') {
      return formatDate(convertStringToDate(data), format, 'en');
    } else {
      return formatDate(new Date(data), format, 'en');
    }
  } catch {
    return data;
  }
}

/**
 * 出発地点の年齢の計算
 * @param birthday 誕生日
 * @param departureDay 出発日
 * @returns 年齢
 */
export function getAgeOfSegmentDate(birthday: Date, departureDay: Date): number {
  let day = birthday.getDate();
  let month = birthday.getMonth();
  //うるう年考慮
  if (birthday.getDate() === 29 && month === 1) {
    if (departureDay.getDate() !== 29 || departureDay.getMonth() !== 1) {
      day = 1;
      month = 2;
    }
  }
  let add = 0;

  const departureYear = new Date(departureDay.getFullYear(), month, day);
  if (departureDay.getMonth() < departureYear.getMonth()) {
    //出発日の月が誕生日未満
    add = -1;
  } else if (departureDay.getMonth() === departureYear.getMonth() && departureDay.getDate() < departureYear.getDate()) {
    //誕生日月かつ出発日の日にちが誕生日未満
    add = -1;
  }
  return departureDay.getFullYear() - birthday.getFullYear() + add;
}

/**
 * 8桁文字列日付をDateに変換
 * @param str 文字列日付
 * @returns 日付
 */
export function string8ToDate(str: string): Date {
  if (8 <= str.length) {
    return new Date(Number(str.slice(0, 4)), Number(str.slice(4, 6)) - 1, Number(str.slice(6, 8)));
  } else if (6 == str.length) {
    return new Date(Number(str.slice(0, 4)), Number(str.slice(4, 5)) - 1, Number(str.slice(5, 6)));
  } else if (7 == str.length) {
    return new Date(Number(str.slice(0, 4)), Number(str.slice(4, 6)) - 1, Number(str.slice(6, 7)));
  }
  return new Date();
}

/**
 * YMD文字列日付をタイムゾーン考慮無しDateに変換
 * @param str 文字列日付
 * @param separators 区切り文字列
 * @returns 日付
 */
export function stringYMDToDate(str: string, separators: Array<string> = ['/', '-']): Date | undefined {
  const splitList = separators.map((separator) => str.split(separator));
  let split = splitList.find((temp) => 3 <= temp.length);
  if (!split) {
    if (str.length === 8 && new RegExp(/(\d{8})/).test(str)) {
      //YYYYMMDDとして扱う
      split = [str.substring(0, 4), str.substring(4, 6), str.substring(6, 8)];
    } else if (str.length === 7 && new RegExp(/(\d{2})([a-zA-Z]{3})(\d{2})/).test(str)) {
      //DDMMMYYとして扱う 文字変換が難しいのでそのまま返す
      const DDMMMYY = new Date(str);
      if (toString.call(DDMMMYY) === `[object Date]` && DDMMMYY.toString() !== 'Invalid Date') {
        return DDMMMYY;
      }
      return undefined;
    } else {
      return undefined;
    }
  }
  //　余計な文字はついていた場合削除
  if (2 < split[2].length) {
    split[2] = split[2].substring(0, 2).replace('T', '');
  }
  const parseDate = new Date(Number(split[0]), Number(split[1]) - 1, Number(split[2]));
  if (toString.call(parseDate) === `[object Date]` && parseDate.toString() !== 'Invalid Date') {
    return parseDate;
  }
  return undefined;
}

/**
 * YMDHms文字列日付をタイムゾーン考慮無しDateに変換
 * @param str 文字列日付
 * @param separators 区切り文字列
 * @returns 日付
 */
export function stringYMDHmsToDate(str: string, separators: Array<string> = ['/', '-']): Date | undefined {
  let strList = str.replace('T', ' ').split(' ');
  const splitList = separators.map((separator) => (strList[0] ?? '').split(separator));
  let splitYmd = splitList.find((temp) => 3 <= temp.length);
  if (!splitYmd) {
    let ymdStr = strList[0] ?? '';
    if (ymdStr.length === 8 && new RegExp(/(\d{8})/).test(ymdStr)) {
      //YYYYMMDDとして扱う
      splitYmd = [ymdStr.substring(0, 4), ymdStr.substring(4, 6), ymdStr.substring(6, 8)];
    } else if (ymdStr.length === 7 && new RegExp(/(\d{2})([a-zA-Z]{3})(\d{2})/).test(ymdStr)) {
      //DDMMMYYとして扱う 文字変換が難しいのでDateに一度変換する
      const DDMMMYYDate = new Date(ymdStr);
      if (toString.call(DDMMMYYDate) === `[object Date]` && DDMMMYYDate.toString() !== 'Invalid Date') {
        splitYmd = [
          DDMMMYYDate.getFullYear().toString(),
          (DDMMMYYDate.getMonth() + 1).toString(),
          DDMMMYYDate.getDate().toString(),
        ];
      } else {
        return undefined;
      }
    } else {
      return undefined;
    }
  }
  let splitHmd = (strList[1] ?? '').split(':');
  if (splitHmd.length < 3) {
    // 時分秒は取れない場合0を入れておく
    splitHmd = ['0', '0', '0'];
  }
  //　余計な文字はついていた場合削除
  if (2 < splitYmd[2].length) {
    splitYmd[2] = splitYmd[2].substring(0, 2);
  }
  if (2 < splitHmd[2].length) {
    splitHmd[2] = splitHmd[2].substring(0, 2);
  }
  const parseDate = new Date(
    Number(splitYmd[0]),
    Number(splitYmd[1]) - 1,
    Number(splitYmd[2]),
    Number(splitHmd[0]),
    Number(splitHmd[1]),
    Number(splitHmd[2])
  );
  if (toString.call(parseDate) === `[object Date]` && parseDate.toString() !== 'Invalid Date') {
    return parseDate;
  }
  return undefined;
}
