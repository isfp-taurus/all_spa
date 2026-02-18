import { LModalContentsWidthType, ModalType } from '@lib/components';
import { ModalBlockParts } from '@lib/services';
import { PlanReviewAddPassengerModalComponent } from './plan-review-add-passenger-modal.component';

/**
 * 搭乗者人数変更モーダルを開く際のパラメータ
 */
export function addPassengerModalParts(): ModalBlockParts {
  return {
    id: 'addPassengerModalParts',
    block: PlanReviewAddPassengerModalComponent,
    closeBackEnable: false,
    type: ModalType.TYPE1,
    modalWidth: LModalContentsWidthType.MODAL_TAB_W384,
  };
}
