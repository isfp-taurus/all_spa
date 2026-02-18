import { ModalType, LModalContentsWidthType } from '@lib/components';
import { ModalIdParts } from '@lib/services';
import { LoungeApplicationModalComponent } from './lounge-application-modal/lounge-application-modal.component';
import { LoungeApplicationModalHeaderComponent } from './lounge-application-modal/lounge-application-modal-header.component';
import { LoungeApplicationModalFooterComponent } from './lounge-application-modal/lounge-application-modal-footer.component';
import { BaggageApplicationModalFooterComponent } from './baggage-application-modal/baggage-application-modal-footer.component';
import { BaggageApplicationModalHeaderComponent } from './baggage-application-modal/baggage-application-modal-header.component';
import { BaggageApplicationModalComponent } from './baggage-application-modal/baggage-application-modal.component';
import { MealApplicationModalFooterComponent } from './meal-application-modal/meal-application-modal-footer.component';
import { MealApplicationModalHeaderComponent } from './meal-application-modal/meal-application-modal-header.component';
import { MealApplicationModalComponent } from './meal-application-modal/meal-application-modal.component';
/**
 * モーダル ペイロード @param LoungeApplicationModal 説明文
 */
export interface LoungeApplicationModalPayload {}
/**
 * 機内食申込画面 (R01-M053)
 * 呼び出しパラメータ
 * const part = loungeApplicationModalPayloadParts(),
 * this.modal.showSubModal(part),
 *}
 */
export function loungeApplicationModalPayloadParts(): ModalIdParts {
  return {
    id: 'LoungeApplicationModalComponent',
    content: LoungeApplicationModalComponent,
    header: LoungeApplicationModalHeaderComponent,
    footer: LoungeApplicationModalFooterComponent,
    closeBackEnable: false,
    type: ModalType.TYPE3,
    modalWidth: LModalContentsWidthType.NONE,
    payload: {} as LoungeApplicationModalPayload,
  };
}

/**
 * 手荷物申込画面 ペイロード(R01-M052)
 * @param BaggageApplicationModalPayload
 */
export interface BaggageApplicationModalPayload {}
/**
 * 手荷物申込画面 (R01-M052)　モーダル呼出しパラメータ
 *
 * const part = baggageApplicationModalPayloadParts(),
 * this.modal.showSubPageModal(part),
 *}
 */
export function baggageApplicationModalPayloadParts(): ModalIdParts {
  return {
    id: 'BaggageApplicationModalComponent',
    content: BaggageApplicationModalComponent,
    header: BaggageApplicationModalHeaderComponent,
    footer: BaggageApplicationModalFooterComponent,
    closeBackEnable: false,
    type: ModalType.TYPE3,
    modalWidth: LModalContentsWidthType.NONE,
    payload: {} as BaggageApplicationModalPayload,
  };
}
/**
 * 機内食申込画面 (R01-M053)のペイロード
 * @param MealApplicationModalPayload
 */
export interface MealApplicationModalPayload {}
/**
 * 機内食申込画面 (R01-M053)
 * 呼び出しパラメータ
 * const part = mealApplicationModalPayloadParts(),
 * this.modal.showSubPageModal(part),
 *}
 */
export function mealApplicationModalPayloadParts(): ModalIdParts {
  return {
    id: 'MealApplicationModalComponent',
    content: MealApplicationModalComponent,
    header: MealApplicationModalHeaderComponent,
    footer: MealApplicationModalFooterComponent,
    closeBackEnable: false,
    type: ModalType.TYPE3,
    modalWidth: LModalContentsWidthType.NONE,
    payload: {} as MealApplicationModalPayload,
  };
}
