/**
 * クラス
 *
 */

/** 表示区分
 * @param NONE 非表示
 * @param DISPLAY_APO_BOTH 出発地＆目的地
 * @param DISPLAY_APO_ORIGIN 出発地
 * @param DISPLAY_APO_DESTINATION 目的地
 * */
export type AirportDisplayType = (typeof AirportDisplayType)[keyof typeof AirportDisplayType];
export const AirportDisplayType = {
  NONE: '0',
  DISPLAY_APO_BOTH: '1',
  DISPLAY_APO_ORIGIN: '2',
  DISPLAY_APO_DESTINATION: '3',
} as const;

/**
 * 空港データ AKAMAIデータのためスネーク型
 * @param name 空港名(表示言語用)
 * @param english_name 空港名(英語用)
 * @param airport_code 空港コード
 * @param search_for_airport_code 照会用空港コード
 * @param region_code 地域コード
 * @param low_frequency_flag 低頻度空港フラグ true:低頻度 false:低頻度ではない
 * @param frequency_used 多頻度空港 0:多頻度ではない 1以上:多頻度表示順
 * @param order 表示順
 * @param index インデックス ア、イ、ウ。。。などの分類
 * @param display_type 表示区分 @see AirportDisplayType
 */
export interface Airport {
  name: string;
  english_name: string;
  airport_code: string;
  search_for_airport_code: string;
  region_code: string;
  low_frequency_flag: boolean;
  frequency_used: number;
  order: number;
  index: string;
  display_type: AirportDisplayType;
}
