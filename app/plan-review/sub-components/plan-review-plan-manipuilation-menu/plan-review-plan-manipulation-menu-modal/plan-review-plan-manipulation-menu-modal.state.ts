import { LModalContentsWidthType, ModalType } from '@lib/components';
import { ModalBlockParts } from '@lib/services';
import { PlanReviewPlanManipulationMenuModalComponent } from './plan-review-plan-manipulation-menu-modal.component';

/**
 * プラン操作メニューモーダルを開く際のパラメータ
 */
export function planReviewPlanManipulationMenuModalParts(): ModalBlockParts {
  return {
    id: 'planReviewPlanManipulationMenuModalParts',
    block: PlanReviewPlanManipulationMenuModalComponent,
    closeBackEnable: true,
    type: ModalType.TYPE7,
    modalWidth: LModalContentsWidthType.MODAL_TAB_W768,
  };
}
