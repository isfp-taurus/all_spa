import { LModalContentsWidthType, ModalType } from '@lib/components';
import { ModalBlockParts } from '@lib/services';
import { PlanReviewAgreementKrModalComponent } from './plan-review-agreement-kr-modal.component';

/**
 * 同意確認モーダル(香港)を開く際のパラメータ
 */
export function agreementKrModalParts(): ModalBlockParts {
  return {
    id: 'agreementKrModalParts',
    block: PlanReviewAgreementKrModalComponent,
    closeBackEnable: false,
    type: ModalType.TYPE2,
    modalWidth: LModalContentsWidthType.MODAL_PC_W500,
  };
}
