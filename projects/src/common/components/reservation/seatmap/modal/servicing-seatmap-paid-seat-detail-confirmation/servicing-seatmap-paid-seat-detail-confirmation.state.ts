import { ModalType } from '@lib/components';
import { ModalBlockParts } from '@lib/services';
import { ServicingSeatmapPaidSeatDetailConfirmationComponent } from './servicing-seatmap-paid-seat-detail-confirmation.component';

export type CouchSeatAppliedPassengerInfo = {
  /** チェック */
  isChecked?: boolean;

  /** チェック有無 */
  hasAvailabilityToCheck?: boolean;

  /** 搭乗者ID */
  PassengerId?: string;
};

export const CHARGABLE_DESCRIPTION_KEY: Record<string, string> = {
  E: 'message.chargableDescription.E',
  A: 'message.chargableDescription.A',
  CH: 'message.chargableDescription.CH',
  L: 'message.chargableDescription.L',
  W: 'message.chargableDescription.W',
  WA: 'message.chargableDescription.WA',
};

export const CHARGABLE_ATTENTION_KEY: Record<string, string> = {
  E: 'message.chargableAttention.E',
  A: 'message.chargableAttention.A',
  CH: 'message.chargableAttention.CH',
  L: 'message.chargableAttention.L',
  W: 'message.chargableAttention.W',
  WA: 'message.chargableAttention.WA',
};

/**
 * 運賃ルール詳細モーダルを開く際のパラメータ
 */
export function servicingSeatmapPaidSeatDetailConfirmationParts(): ModalBlockParts {
  return {
    id: 'PlanReviewFareConditionDetailsModalComponent',
    block: ServicingSeatmapPaidSeatDetailConfirmationComponent,
    closeBackEnable: true,
    type: ModalType.TYPE2,
  };
}
