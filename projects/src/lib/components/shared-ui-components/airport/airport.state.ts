import { Airport, Region } from 'src/lib/interfaces';

/**
 * 発着識別
 * @param DEPARTURE 出発地
 * @param DESTINATION 到着地
 * @param NONE 指定なし
 */
export type TerminalType = (typeof TerminalType)[keyof typeof TerminalType];
export const TerminalType = {
  DEPARTURE: 'Departure',
  DESTINATION: 'Destination',
  NONE: 'NONE',
} as const;

/**
 * 空港選択部品 組み込み元からの設定部分
 * @param airportList 空港リスト @see Airport
 * @param regionList 地域リスト @see Region
 * @param terminalType 発着識別 @see TerminalType
 * @param initialRegionCode 初期地域コード
 * @param inputLabel inputのラベル
 *
 */
export type AirportListParts = {
  airportList?: Airport[];
  regionList?: Region[];
  terminalType?: TerminalType;
  initialRegionCode?: string;
  inputLabel?: string;
};

/**
 * 以下内部で使用する型
 */
//空港選択部品内で使用する地域と空港を結び付けた情報
export type RegionAirports = {
  region: ComponentRegion;
  indexList: string[]; // 地域に含まれるインデックス他、主要空港も含まれる
  indexAirports: Array<{
    id?: string;
    index: string;
    airports: ComponentAirport[];
    isIndex: boolean; // true:Accordionによる折り畳みをする false:常に展開状態にする（indexなしの場合に使用）
  }>;
};

// 空港選択部品内で使用する地域 元データを拡張して内部で使用する情報を追加
export interface ComponentRegion extends Region {
  id: string; // HTMLに設定するid DOMアクセス時に紐づける
}
// 空港選択部品内で使用する空港 元データを拡張して内部で使用する情報を追加
export interface ComponentAirport extends Airport {
  id: string; // HTMLに設定するid DOMアクセス時に紐づける
  displayName: string; // inputに表示する空港名称
}
