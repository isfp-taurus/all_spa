import { MasterStoreKey } from '@conf/asw-master.config';
import { LModalContentsWidthType, ModalType } from '@lib/components';
import { ModalBlockParts } from '@lib/services';
import { TemporaryUrlModalComponent } from './temporary-url-modal.component';

/**
 * 一時URLモーダルを開く際のパラメータ
 */
export function temporaryUrlModalParts(): ModalBlockParts {
  return {
    id: 'temporaryUrlModalParts',
    block: TemporaryUrlModalComponent,
    closeBackEnable: true,
    type: ModalType.TYPE1,
    modalWidth: LModalContentsWidthType.MODAL_TAB_W345,
  };
}

/**
 * オフィス_全リスト キャッシュ
 */
export const getOfficeAllMasterKey = [{ key: MasterStoreKey.OFFICE_ALL, fileName: 'Office_All' }];
