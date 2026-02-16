import { formatDate } from '@angular/common';
import { convertStringToDate } from '@lib/helpers';

/**
 * 日付フォーマット
 *
 * @param data 日付
 * @param format フォーマットキー
 * @returns
 */
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
 * 分から時刻に変更する。(70 ⇒ '01:10')
 *
 * @param minutes 分
 * @returns 時刻
 */
export function minutesToTimeFormat(minutes: number | string) {
  if (Number.isNaN(Number(minutes))) {
    if (minutes === '24:00') {
      minutes = '23:59';
    }
    return minutes;
  }

  let hours = Math.floor(Number(minutes) / 60);
  let minute = Number(minutes) % 60;
  let result = `${hours.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  if (result === '24:00') {
    result = '23:59';
  }
  return result;
}

/**
 * 時刻から分に変更する。('01:10' ⇒ 70)
 *
 * @param 時刻
 * @returns 分
 */
export function timeToMinutesFormate(time: string): number {
  const date = new Date(`1970/01/01 ${time}`);
  const hour = date.getHours();
  const minute = date.getMinutes();
  return hour * 60 + minute;
}

export function isSameDay(dateTime: string, estimatedDateTime: string): boolean {
  return dateFormat(dateTime, 'yyyyMMdd') === dateFormat(estimatedDateTime, 'yyyyMMdd');
}

/**
 * 秒を時間形式に変換
 * @param duration 秒
 * @returns HH:mm:ss
 */
export function getFormatHourTime(seconds: number | null): string {
  try {
    let formattedTime = '';
    if (seconds) {
      const hours = Math.floor(seconds / 3600);
      const mimutes = Math.floor((seconds % 3600) / 60);
      const second = Math.floor((seconds % 3600) % 60);
      formattedTime = `${hours < 10 ? '0' : ''}${hours}:${mimutes < 10 ? '0' : ''}${mimutes}:${
        second < 10 ? '0' : ''
      }${second}`;
    } else {
      return '00:00:00';
    }
    return formattedTime;
  } catch {
    return '00:00:00';
  }
}

/**
 * 分を時間形式に変換
 * @param mimutes 分
 * @returns HH:mm:ss
 */
export function getFormatHourTimeForMinutes(mimutes: number | null): string {
  try {
    let formattedTime = '';
    if (mimutes) {
      const hours = Math.floor(mimutes / 60);
      const mimute = Math.floor(mimutes % 60);
      formattedTime = `${hours < 10 ? '0' : ''}${hours}:${mimute < 10 ? '0' : ''}${mimute}:00`;
    } else {
      return '00:00:00';
    }
    return formattedTime;
  } catch {
    return '00:00:00';
  }
}
