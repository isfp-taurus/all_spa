import { PassengerInformationRequestEditType } from '@common/interfaces';
import { ModalType, LModalContentsWidthType } from '@lib/components';
import { ModalIdParts } from '@lib/services';
import { PassengerInformationRequestFooterComponent } from './passenger-information-request-footer.component';
import { PassengerInformationRequestHeaderComponent } from './passenger-information-request-header.component';
import { PassengerInformationRequestComponent } from './passenger-information-request.component';

/**
 * モーダル ペイロード @param LPassengerInformationRequestPayload 説明文
 * @param isEditMode 編集中か否か
 * @param editArea @see PassengerInformationRequestEditType
 */
export interface PassengerInformationRequestPayload {
  isEditMode: boolean;
  editArea: number;
}
/**
 * 搭乗者情報入力画面 (R01-M060)
 * 呼び出しパラメータ
 * const part = loungeApplicationModalPayloadParts(),
 * this.modal.showSubModal(part),
 *}
 */
export function passengerInformationRequestPayloadParts(
  isEditMode = false,
  editArea: number = PassengerInformationRequestEditType.NOT_EDITTING
): ModalIdParts {
  return {
    id: 'passengerInformationRequestComponent',
    content: PassengerInformationRequestComponent,
    header: PassengerInformationRequestHeaderComponent,
    footer: isEditMode ? PassengerInformationRequestFooterComponent : undefined,
    closeBackEnable: false,
    type: ModalType.TYPE8,
    modalWidth: LModalContentsWidthType.MODAL_PC_W768,
    payload: {
      isEditMode: isEditMode,
      editArea: editArea,
    } as PassengerInformationRequestPayload,
  };
}
