import { LModalContentsWidthType, ModalType } from '@lib/components';
import { ModalBlockParts } from '@lib/services';
import { PlanReviewAgreementHkModalComponent } from './plan-review-agreement-hk-modal.component';

/**
 * 同意確認モーダル(香港)を開く際のパラメータ
 */
export function agreementHkModalParts(): ModalBlockParts {
  return {
    id: 'agreementHkModalParts',
    block: PlanReviewAgreementHkModalComponent,
    closeBackEnable: false,
    type: ModalType.TYPE2,
    modalWidth: LModalContentsWidthType.MODAL_PC_W500,
  };
}
