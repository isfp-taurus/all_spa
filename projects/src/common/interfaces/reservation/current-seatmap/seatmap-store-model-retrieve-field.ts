import { ChildSeatRequestInfo } from './child-seats-request-info';
import { PassengerForServicingSeatmapScreen } from './passenger-for-seatmap-screen';
import { SeatInfo } from './seat-info';

export interface SeatmapStoreModelRetrieveField {
  /** 搭乗者マップ */
  passengers?: Map<string, PassengerForServicingSeatmapScreen>;

  /** 選択中座席情報リスト */
  selectedSeatInfoList?: SeatInfo[];

  /** チャイルドシート申込リスト */
  childSeatAppliedList?: ChildSeatRequestInfo[];
}

export function initSeatmapStoreModelRetrieveField(): SeatmapStoreModelRetrieveField {
  return {
    passengers: new Map(),
    selectedSeatInfoList: [],
    childSeatAppliedList: [],
  };
}
