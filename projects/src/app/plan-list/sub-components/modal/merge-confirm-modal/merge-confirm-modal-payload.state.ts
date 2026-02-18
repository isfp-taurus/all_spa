import { LModalContentsWidthType, ModalType } from '@lib/components';
import { ModalBlockParts } from '@lib/services';
import { MergeConfirmModalComponent } from './merge-confirm-modal.component';

/**
 * モーダル ペイロード
 * @param MergeConfirmModalPayload 説明文
 */
export interface MergeConfirmModalPayload {
  mergeEvent?: () => void;
}

/**
 * モーダル呼び出しパラメータ
 *
 */
export function MergeConfirmModalPayloadParts(): ModalBlockParts {
  return {
    id: 'MergeConfirmModalComponent',
    block: MergeConfirmModalComponent,
    closeBackEnable: true,
    type: ModalType.TYPE1,
    modalWidth: LModalContentsWidthType.NONE,
    payload: {} as MergeConfirmModalPayload,
  };
}
