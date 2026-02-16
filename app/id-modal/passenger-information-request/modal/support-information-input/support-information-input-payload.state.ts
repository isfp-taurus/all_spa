import { LModalContentsWidthType, ModalType } from '@lib/components';
import { ModalBlockParts } from '@lib/services';
import { SupportInformationInputComponent } from './support-information-input.component';

/**
 * サポート情報入力モーダル　ペイロード
 * @param amountType 差分強調表示フラグ DEL:削除済み DIFF:差分強調 NONE:強調無し
 */
export interface SupportInformationInputPayload {}

/**
 * サポート情報入力モーダルを開く際のパラメータ、payloadの設定は各自で行う
 * 例：
 * const part = supportInformationInputModalParts;
 * this.modal.showSubModal(part);
 *}
 */
export function supportInformationInputModalParts(): ModalBlockParts {
  return {
    id: 'SupportInformationInputComponentParts',
    block: SupportInformationInputComponent,
    closeBackEnable: false,
    type: ModalType.TYPE7,
    modalWidth: LModalContentsWidthType.MODAL_PC_W768,
  };
}
