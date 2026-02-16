import { LModalContentsWidthType, ModalType } from '@lib/components';
import { ModalBlockParts } from '@lib/services';
import { SelectNextPageModalComponent } from './select-next-page-modal.component';

/**
 * 名前の表示順　0or1or2
 */
export interface selectNextPageModalPayload {
  order: string;
  isFromPlanView: boolean;
}
/**
 * モーダルパラメータ
 * const part = selectNextPageModalPayloadParts();
 * this.modal.showSubModal(part);
 */
export function selectNextPageModalPayloadParts(isFromPlanView: boolean): ModalBlockParts {
  return {
    id: 'selectNextPageModalComponent',
    block: SelectNextPageModalComponent,
    closeBackEnable: false,
    type: ModalType.TYPE2,
    modalWidth: LModalContentsWidthType.NONE,
    payload: { isFromPlanView: isFromPlanView } as selectNextPageModalPayload,
  };
}
