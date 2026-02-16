import { ActionCreator, createReducer, on, ReducerTypes } from '@ngrx/store';
import { asyncStoreItemAdapter } from '@lib/store';
import * as actions from './not-eligible-information.actions';
import { NotEligibleInformationState } from './not-eligible-information.state';

/**
 * notEligibleInformation initial state
 */
export const notEligibleInformationInitialState: NotEligibleInformationState = {
  searchMethodSelection: '', // 検索方法選択
  reservationNumber: '', // 予約番号
  passengerName: {
    firstName: '', // 搭乗者名(名)
    lastName: '', // 搭乗者名(姓)
  },
  collaborationSiteId: '', // 連携サイトID
  errorId: '', // エラーID
};

/**
 * List of basic actions for NotEligibleInformation Store
 */
export const notEligibleInformationReducerFeatures: ReducerTypes<NotEligibleInformationState, ActionCreator[]>[] = [
  on(actions.setNotEligibleInformation, (state, payload) => ({ ...payload })),

  on(actions.updateNotEligibleInformation, (state, payload) => ({ ...state, ...payload })),

  on(actions.resetNotEligibleInformation, () => notEligibleInformationInitialState),
];

/**
 * NotEligibleInformation Store reducer
 */
export const notEligibleInformationReducer = createReducer(
  notEligibleInformationInitialState,
  ...notEligibleInformationReducerFeatures
);
