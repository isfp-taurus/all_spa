import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CURRENT_CART_STORE_NAME, CurrentCartState } from './current-cart.state';

/** Select CurrentCart State */
export const selectCurrentCartState = createFeatureSelector<CurrentCartState>(CURRENT_CART_STORE_NAME);

/** Select CurrentCart isPending status */
export const selectCurrentCartIsPendingStatus = createSelector(selectCurrentCartState, (state) => !!state.isPending);

/** Select CurrentCart isFailure status */
export const selectCurrentCartIsFailureStatus = createSelector(selectCurrentCartState, (state) => !!state.isFailure);
