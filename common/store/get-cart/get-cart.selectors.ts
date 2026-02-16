import { createFeatureSelector, createSelector } from '@ngrx/store';
import { GET_CART_STORE_NAME, GetCartState } from './get-cart.state';

/** Select GetCart State */
export const selectGetCartState = createFeatureSelector<GetCartState>(GET_CART_STORE_NAME);

/** Select GetCart isPending status */
export const selectGetCartIsPendingStatus = createSelector(selectGetCartState, (state) => !!state.isPending);

/** Select GetCart isFailure status */
export const selectGetCartIsFailureStatus = createSelector(selectGetCartState, (state) => !!state.isFailure);
