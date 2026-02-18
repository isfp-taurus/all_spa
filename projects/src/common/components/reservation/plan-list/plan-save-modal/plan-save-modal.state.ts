import { LModalContentsWidthType, ModalType } from '@lib/components';
import { ModalBlockParts } from '@lib/services';
import { PlanSaveModalComponent } from './plan-save-modal.component';

/**
 * プラン保存モーダルを開く際のパラメータ
 */
export function planSaveModalParts(): ModalBlockParts {
  return {
    id: 'planSaveModalParts',
    block: PlanSaveModalComponent,
    closeBackEnable: true,
    type: ModalType.TYPE1,
    modalWidth: LModalContentsWidthType.MODAL_TAB_W345,
  };
}
