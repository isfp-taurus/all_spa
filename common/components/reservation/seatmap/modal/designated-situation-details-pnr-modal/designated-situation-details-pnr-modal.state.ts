import { ModalType, LModalContentsWidthType } from '@lib/components';
import { ModalBlockParts } from '@lib/services';
import { DesignatedSituationDetailsPnrModalComponent } from './designated-situation-details-pnr-modal.component';
/**
 * 指定状況詳細(PNR)モーダル　ペイロード
 * @param xxxxxx 説明文
 */
export interface DesignatedSituationDetailsPnrModalPayload {}

/**
 * 指定状況詳細(PNR)モーダル、payloadの設定は各自で行う
 * 例：
 * const part = designatedSituationDetailsPnrModalPayloadParts();
 * this.modal.showSubModal(part);
 *}
 */
export function designatedSituationDetailsPnrModalPayloadParts(): ModalBlockParts {
  return {
    id: 'designatedSituationDetailsPnrModalComponent',
    block: DesignatedSituationDetailsPnrModalComponent,
    closeBackEnable: false,
    type: ModalType.TYPE4,
    modalWidth: LModalContentsWidthType.MODAL_PC_W768,
  };
}

/**
 * 選択中座席情報リスト
 * セグメントID	“”(空欄)
 * 	搭乗者リスト	“”(空欄)
 * 		搭乗者ID	“”(空欄)
 * 		選択している座席情報	“”(空欄)
 * 			座席番号リスト	“”(空欄)のリスト
 * 			 座席番号 -
 * 			座席属性	-
 * 				SSRコード	“”(空欄)
 * 			SSR情報	-
 * 				更新区分	“”(空欄)
 * 				SSRコード	“”(空欄)
 * 			指定金額	“”(空欄)
 * 			バシネット特性有無	false
 * 			チャイルドシート選択可否	false
 */
export interface SelectedSeatInformation {
  [key: string]: SelectedSeatInformationSegment;
}
export interface SelectedSeatInformationSegment {
  passengerList: Array<SelectedSeatInformationSegmentPassenger>;
}
export interface SelectedSeatInformationSegmentPassenger {
  passengerId: string;
  info: {
    seatNumbers: string[];
    seatType: {
      ssrCode: string;
    };
    ssrInfo: {
      updateType: string;
      ssrCode: string;
    };
    amount: string;
    isPasinet: boolean;
    isChildSeatEnable: boolean;
  };
}

export type pnrModalDisplayPassenger = Array<Array<Array<{ id: string; accompanyingInfantId?: string }>>>;
