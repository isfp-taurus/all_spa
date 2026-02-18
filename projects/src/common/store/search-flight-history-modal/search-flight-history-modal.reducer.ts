import { ActionCreator, createReducer, on, ReducerTypes } from '@ngrx/store';
import * as actions from './search-flight-history-modal.actions';
import { SearchFlightHistoryModalState } from './search-flight-history-modal.state';

/**
 * searchFlightHistoryModal initial state
 */
export const SearchFlightHistoryModalInitialState: SearchFlightHistoryModalState = {
  apiRequestState: 'unexecuted',
  warnings: [],
  histories: [],
  favorite: [],
};

/**
 * List of basic actions for SearchFlightHistoryModal Store
 */
export const searchFlightHistoryModalReducerFeatures: ReducerTypes<SearchFlightHistoryModalState, ActionCreator[]>[] = [
  on(actions.setSearchFlightHistoryModal, (_state, payload) => ({ ...payload })),

  on(actions.updateSearchFlightHistoryModal, (_state, payload) => ({ ..._state, ...payload })),

  on(actions.resetSearchFlightHistoryModal, () => SearchFlightHistoryModalInitialState),
];

/**
 * SearchFlightHistoryModal Store reducer
 */
export const searchFlightHistoryModalReducer = createReducer(
  SearchFlightHistoryModalInitialState,
  ...searchFlightHistoryModalReducerFeatures
);
