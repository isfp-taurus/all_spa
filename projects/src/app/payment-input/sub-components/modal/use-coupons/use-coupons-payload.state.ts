import { LModalContentsWidthType, ModalType } from '@lib/components';
import { ModalBlockParts } from '@lib/services';
import { UseCouponsComponent } from './use-coupons.component';
import { PreviousScreenHandoverInformation } from '../../../container/payment-input-cont.state';

/**
 * プロモーションコード入力モーダルを開く際のパラメータ
 */
export function useCouponsPayloadParts(payload: UseCouponsPayload): ModalBlockParts {
  return {
    id: 'useCouponsComponent',
    block: UseCouponsComponent,
    closeBackEnable: false,
    type: ModalType.TYPE1,
    payload: payload,
    modalWidth: LModalContentsWidthType.MODAL_TAB_W384,
  };
}

export type UseCouponsPayload = PreviousScreenHandoverInformation;
