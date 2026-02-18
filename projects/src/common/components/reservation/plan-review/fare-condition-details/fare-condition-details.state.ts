import { LModalContentsWidthType, ModalType } from '@lib/components';
import { ModalBlockParts } from '@lib/services';
import { FareConditionDetailsModalComponent } from './fare-condition-details.component';

/**
 * 運賃ルール詳細モーダルを開く際のパラメータ
 */
export function fareConditionDetailsModalParts(): ModalBlockParts {
  return {
    id: 'PlanReviewFareConditionDetailsModalComponent',
    block: FareConditionDetailsModalComponent,
    closeBackEnable: false,
    type: ModalType.TYPE2,
    modalWidth: LModalContentsWidthType.MODAL_PC_W1000,
  };
}
