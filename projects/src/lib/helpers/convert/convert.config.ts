/**
 * 入力値変換ルール定義
 */
export class ConvertConfig {
  /**
   * タブ文字 → 半角スペース変換ルール
   * - タブ文字（複数個連続したタブ文字含む）を、1つの半角スペースに変換するルール
   *
   * @static
   */
  static tabToSpaceHalfWidthRule: [string, number][] = [
    ['\\u0009+', 0x20], // [タブ文字の正規表現, 半角スペース]
  ];

  /**
   * 英数字記号変換ルール（全角 → 半角）
   * - 全角英数字記号・全角スペースを半角英数字記号・半角スペースに変換するルール
   *
   * @static
   */
  static fullToHalfWidthRule: [string, number, boolean?][] = [
    ['[\\uff01-\\uff5e]', -0xfee0, true], // [全角英数字記号の正規表現, 全角と半角のUnicodeの差, Unicode差分計算(true))]
    ['\\u3000', 0x20], // [全角スペースの正規表現, 半角スペース]
  ];

  /**
   * ハイフン変換ルール（全角 → 半角）
   * - 全角マイナス『－』・全角ダッシュ『―』・全角波ダッシュ『～』 → 半角ハイフン『-』に変換するルール
   *
   * @static
   */
  static changeToHyphenHalfWidthRule: [string, number][] = [
    ['[\\uff0d\\u2015\\uff5e]', 0x2d], // [『－―～』の正規表現, 『-』]
  ];

  /**
   * 半角スペース削除ルール
   * - 文字列中に含まれる半角スペースを全て削除するルール
   *
   * @static
   */
  static trimSpaceHalfWidthRule: [string, number][] = [
    ['\\u0020', 0], // [半角スペースの正規表現, 削除フラグ(0)]
  ];

  /**
   * 半角丸括弧『()』・半角プラス『+』・半角ハイフン『-』削除ルール
   * - 文字列中に含まれる対象を全て削除するルール
   *
   * @static
   */
  static trimBracketsPlusHyphenHalfWidthRule: [string, number][] = [
    ['[\\u0028\\u0029\\u002b\\u002d]', 0], // [『()+-』の正規表現, 削除フラグ(0)]
  ];
}
