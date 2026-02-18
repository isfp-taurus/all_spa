import { BoundFlightListId } from '@common/components/reservation/seatmap/seatmap-footer-area/seatmap-footer-area.state';

/**
 * セグメント情報アクセスためのインデックス情報
 */
export interface SegmentPosInfo extends BoundFlightListId {
  segmentId: string;
}
import { GetOrderState, SeatmapsState } from '@common/store';

/** 画面情報JSON */
export type DisplayInfoJSON = {
  /** PayPal使用可否 */
  isPaypalAvailable: boolean;
};

/**
 * 動的文言に渡すパラメータ
 * @param getOrderReply PNR情報
 * @param getSeatmapsReply シートマップ情報
 * @param pageContext 画面情報JSON
 */
export interface SeatmapDynamicParams {
  getOrderReply?: GetOrderState;
  getSeatmapsReply?: SeatmapsState;
  pageContext?: DisplayInfoJSON;
}
export function defaultSeatmapDynamicParams(): SeatmapDynamicParams {
  return {
    getOrderReply: undefined,
    getSeatmapsReply: undefined,
    pageContext: { isPaypalAvailable: false },
  };
}
