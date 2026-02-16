import { ConvertConfig } from './convert.config';

/**
 * 不要空白除去
 * - タブ文字を半角スペースに変換
 *   - @see {@link ConvertConfig.tabToSpaceHalfWidthRule}
 * - 先頭と末尾に存在する、半角スペース・全角スペースを削除
 *
 * @param {string} data 変換前の値
 * @returns {string} 変換後の値
 */
export function convertSpaceNormalize(data: string): string {
  return convertCommon(data, [...ConvertConfig.tabToSpaceHalfWidthRule]).trim();
}

/**
 * 予約情報変換
 * - 英数字記号変換（全角 → 半角）
 *   - @see {@link ConvertConfig.fullToHalfWidthRule}
 * - 英小文字を英大文字に変換
 *
 * @param {string} data 変換前の値
 * @returns {string} 変換後の値
 */
export function convertReservationInfo(data: string): string {
  return convertCommon(data, [...ConvertConfig.fullToHalfWidthRule]).toUpperCase();
}

/**
 * 搭乗者名変換
 * - 英数字記号変換（全角 → 半角）
 *   - @see {@link ConvertConfig.fullToHalfWidthRule}
 * - 半角スペース削除
 *   - @see {@link ConvertConfig.trimSpaceHalfWidthRule}
 * - 英小文字を英大文字に変換
 *
 * @param {string} data 変換前の値
 * @returns {string} 変換後の値
 */
export function convertPaxName(data: string): string {
  return convertCommon(data, [
    ...ConvertConfig.fullToHalfWidthRule,
    ...ConvertConfig.trimSpaceHalfWidthRule,
  ]).toUpperCase();
}

/**
 * 電話番号変換
 * - 英数字記号変換（全角 → 半角）
 *   - @see {@link ConvertConfig.fullToHalfWidthRule}
 * - 半角丸括弧『()』・半角プラス『+』・半角ハイフン『-』削除
 *   - @see {@link ConvertConfig.trimBracketsPlusHyphenHalfWidthRule}
 *
 * @param {string} data 変換前の値
 * @returns {string} 変換後の値
 */
export function convertPhoneNumber(data: string): string {
  return convertCommon(data, [
    ...ConvertConfig.fullToHalfWidthRule,
    ...ConvertConfig.trimBracketsPlusHyphenHalfWidthRule,
  ]);
}

/**
 * ハイフン変換
 * - ハイフン変換（全角 → 半角）
 *   - @see {@link ConvertConfig.changeToHyphenHalfWidthRule}
 *
 * @param {string} data 変換前の値
 * @returns {string} 変換後の値
 */
export function convertToHyphen(data: string): string {
  return convertCommon(data, [...ConvertConfig.changeToHyphenHalfWidthRule]);
}

/**
 * メールアドレス変換
 * - 英数字記号変換（全角 → 半角）
 *   - @see {@link ConvertConfig.fullToHalfWidthRule}
 *
 * @param {string} data 変換前の値
 * @returns {string} 変換後の値
 */
export function convertEmailAddress(data: string): string {
  return convertCommon(data, [...ConvertConfig.fullToHalfWidthRule]);
}

/**
 * 変換用共通処理
 *
 * @param {string} data 変換前の値
 * @param {[string, number, boolean?][]} rules 変換ルール
 * - 2つ指定の場合は変換後値直接指定するパターン：[変換対象の正規表現, 変換後値]
 * - 3つ指定の場合は文字コードシフトパターン：[変換対象の正規表現, 変換対象と変換後のUnicodeの差, Unicode差分計算判定]
 *
 * @returns {string} 変換後の値
 */
export function convertCommon(data: string, rules: [string, number, boolean?][]): string {
  return rules.reduce((init, current) => {
    if (current[2]) {
      return init.replace(new RegExp(current[0], 'g'), (v: string) =>
        String.fromCharCode(v.charCodeAt(0) + current[1])
      );
    } else {
      return init.replace(new RegExp(current[0], 'g'), current[1] !== 0 ? String.fromCharCode(current[1]) : '');
    }
  }, data);
}

/**
 * string型日付をDate型に変換
 * - 日付のみの文字列の場合、ローカル日付を返却する
 * ※日付のみの文字列（例: "1970-01-01"）は UTC として扱われるため
 * - 日付のみの文字列パターン：yyyy-MM-dd、yyyy/MM/dd
 * - タイムゾーンありの日時文字列の場合、ローカル日付（時刻の0時にする）を返却する
 *
 * @param {string} dateString 日付文字列
 * @returns {Date}
 */
export function convertStringToDate(dateString: string): Date {
  // yyyy/MM/dd
  if (new RegExp('^[0-9]{4}/(0[1-9]|1[0-2])/(0[1-9]|[12][0-9]|3[01])$').test(dateString)) {
    const dateNumbers = dateString.split('/').map(Number);
    return new Date(dateNumbers[0], dateNumbers[1] - 1, dateNumbers[2]);
  }
  // yyyy-MM-dd
  if (new RegExp('^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$').test(dateString)) {
    const dateNumbers = dateString.split('-').map(Number);
    return new Date(dateNumbers[0], dateNumbers[1] - 1, dateNumbers[2]);
  }
  // yyyy-MM-ddTHH:mm:ss[+-]HHmm
  if (
    new RegExp(
      '^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])T([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]([+]((0[0-9]|1[0-3])[0-5][0-9]|1400)|[-]((0[0-9]|1[0-1])[0-5][0-9]|1200))$'
    ).test(dateString)
  ) {
    const dateStrings = dateString.split('T').map(String);
    const dateNumbers = dateStrings[0].split('-').map(Number);
    return new Date(dateNumbers[0], dateNumbers[1] - 1, dateNumbers[2]);
  }
  return new Date(dateString);
}
