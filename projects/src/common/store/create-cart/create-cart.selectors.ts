import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CREATE_CART_STORE_NAME, CreateCartState } from './create-cart.state';

/** Select CreateCart State */
export const selectCreateCartState = createFeatureSelector<CreateCartState>(CREATE_CART_STORE_NAME);

/** Select CreateCart isPending status */
export const selectCreateCartIsPendingStatus = createSelector(selectCreateCartState, (state) => !!state.isPending);

/** Select CreateCart isFailure status */
export const selectCreateCartIsFailureStatus = createSelector(selectCreateCartState, (state) => !!state.isFailure);
