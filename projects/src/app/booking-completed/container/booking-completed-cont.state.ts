import { FareConditionsState } from '@common/store';
import { GetOrderResponse } from 'src/sdk-servicing';

/** 画面情報JSON */
export type DisplayInfoJSON = {
  /** 支払手段 */
  paymentMethod?: string;
  /** 3DS有無 */
  is3DSecureApplied?: boolean;
  /** アップセル運賃情報 */
  upsellAmount?: { outbound?: number; inbound?: number };
  /** 現金系決済フラグ */
  isCashSettlement?: boolean;
};

/**
 * 動的文言に渡すパラメータ
 * @param getOrderReply PNR情報取得
 * @param fareConditionsReply 運賃ルール・手荷物情報取得
 * @param pageContext 画面情報JSON型
 */
export interface BookingCompletedDynamicParams {
  getOrderReply?: GetOrderResponse;
  fareConditionsReply?: FareConditionsState;
  pageContext?: DisplayInfoJSON;
}
export function defaultBookingCompletedDynamicParams(): BookingCompletedDynamicParams {
  return {
    getOrderReply: undefined,
    fareConditionsReply: undefined,
    pageContext: {
      paymentMethod: '',
      is3DSecureApplied: false,
      upsellAmount: {},
      isCashSettlement: false,
    },
  };
}
