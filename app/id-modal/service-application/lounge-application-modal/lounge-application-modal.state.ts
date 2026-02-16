import { PostGetCartResponse } from 'src/sdk-reservation/model/postGetCartResponse';

/**
 * 動的文言に渡すパラメータ
 * @param getCartReply カート情報
 */
export interface LoungeApplicationDynamicParams {
  getCartReply?: PostGetCartResponse;
}
export function defaultLoungeApplicationDynamicParams(cartReply: PostGetCartResponse): LoungeApplicationDynamicParams {
  return {
    getCartReply: cartReply,
  };
}
