import { createFeatureSelector, createSelector } from '@ngrx/store';
import { DELETE_PREBOOKED_ORDER_STORE_NAME, DeletePrebookedOrderState } from './delete-prebooked-order.state';

/** Select DeletePrebookedOrder State */
export const selectDeletePrebookedOrderState = createFeatureSelector<DeletePrebookedOrderState>(
  DELETE_PREBOOKED_ORDER_STORE_NAME
);

/** Select DeletePrebookedOrder isPending status */
export const selectDeletePrebookedOrderIsPendingStatus = createSelector(
  selectDeletePrebookedOrderState,
  (state) => !!state.isPending
);

/** Select DeletePrebookedOrder isFailure status */
export const selectDeletePrebookedOrderIsFailureStatus = createSelector(
  selectDeletePrebookedOrderState,
  (state) => !!state.isFailure
);
