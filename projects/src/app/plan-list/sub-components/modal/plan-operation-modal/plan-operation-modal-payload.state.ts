import { PlanListCurrentPlan } from '@common/interfaces';
import { LModalContentsWidthType, ModalType } from '@lib/components';
import { ModalBlockParts } from '@lib/services';
import { PlanOperationModalComponent } from './plan-operation-modal.component';

/**
 * モーダル ペイロード
 * @param PlanOperationModal 説明文
 */
export interface PlanOperationModalPayload {
  selectPlan: PlanListCurrentPlan;
}

/**
 * モーダル呼び出しパラメータ
 *
 */
export function PlanOperationModalPayloadParts(selectPlan: PlanListCurrentPlan): ModalBlockParts {
  return {
    id: 'PlanOperationModalComponent',
    block: PlanOperationModalComponent,
    closeBackEnable: true,
    type: ModalType.TYPE4,
    modalWidth: LModalContentsWidthType.NONE,
    payload: { selectPlan: selectPlan } as PlanOperationModalPayload,
  };
}
