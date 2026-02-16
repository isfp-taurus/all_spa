import { Subject } from 'rxjs';

/** ソート条件の種類と使用するラベルの定義 */
export type SortCondition = (typeof SortCondition)[keyof typeof SortCondition];
export const SortCondition = {
  CPD_RANK: 0,
  DEPARTURE_TIME: 1,
  ARRIVAL_TIME: 2,
  DURATION: 3,
  PriceDifference: 4,
} as const;

export type SortConditionValue = {
  label: string;
};
export const sortConditionValueMap = new Map<number, SortConditionValue>([
  [SortCondition.CPD_RANK, { label: 'label.recommendedOrder' }],
  [SortCondition.DEPARTURE_TIME, { label: 'label.departureTimeOrder' }],
  [SortCondition.ARRIVAL_TIME, { label: 'label.arrivalTimeOrder' }],
  [SortCondition.DURATION, { label: 'label.flightDurationOrder' }],
  [SortCondition.PriceDifference, { label: 'label.fareDifferenceSort' }],
]);

export type SortConditionData = {
  selectedSortCondition?: SortCondition;
};

export type SortConditionInput = {
  data: SortConditionData | null;
  subject: Subject<SortConditionOutput>;
};

export type SortConditionOutput = {
  selectedSortCondition: SortCondition;
};
