import { PlansGetPlansResponse, PostGetCartResponse } from 'src/sdk-reservation';

/**
 * 動的文言に渡すパラメータ
 * @param getPlansReply プラン情報
 * @param getCartReply カート情報
 */
export interface PlanListDynamicParams {
  getPlansReply?: PlansGetPlansResponse;
  getCartReply?: PostGetCartResponse[];
}
export function defaultPlanListDynamicParams(): PlanListDynamicParams {
  return {
    getPlansReply: undefined,
    getCartReply: undefined,
  };
}
