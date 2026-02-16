import { PostGetCartResponse } from 'src/sdk-reservation/model/postGetCartResponse';

/**
 * 動的文言に渡すパラメータ
 * @param getCartReply カート情報
 */
export interface BaggageApplicationDynamicParams {
  getCartReply?: PostGetCartResponse;
}
export function defaultBaggageApplicationDynamicParams(
  cartReply: PostGetCartResponse
): BaggageApplicationDynamicParams {
  return {
    getCartReply: cartReply,
  };
}
