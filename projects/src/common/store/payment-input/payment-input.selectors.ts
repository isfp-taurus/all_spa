import { createFeatureSelector, createSelector } from '@ngrx/store';
import { PAYMENT_INPUT_STORE_NAME, PaymentInputState } from './payment-input.state';

/** Select PaymentInput State */
export const selectPaymentInputState = createFeatureSelector<PaymentInputState>(PAYMENT_INPUT_STORE_NAME);

/** Select PaymentInput isPending status */
export const selectPaymentInputIsPendingStatus = createSelector(selectPaymentInputState, (state) => !!state.isPending);

/** Select PaymentInput isFailure status */
export const selectPaymentInputIsFailureStatus = createSelector(selectPaymentInputState, (state) => !!state.isFailure);
