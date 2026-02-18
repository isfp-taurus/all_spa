import { ActionCreator, createReducer, on, ReducerTypes } from '@ngrx/store';
import { asyncStoreItemAdapter } from '@lib/store';
import * as actions from './payment-input.actions';
import { PaymentInputState } from './payment-input.state';

/**
 * paymentInput initial state
 */
export const paymentInputInitialState: PaymentInputState = {
  requestIds: [],
  previousPage: '',
  isNeedRefresh: false,
};

/**
 * List of basic actions for PaymentInput Store
 */
export const paymentInputReducerFeatures: ReducerTypes<PaymentInputState, ActionCreator[]>[] = [
  on(actions.setPaymentInput, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest(
      { ...asyncStoreItemAdapter.extractAsyncStoreItem(state), ...payload },
      payload.requestId
    )
  ),

  on(actions.updatePaymentInput, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest({ ...state, ...payload }, payload.requestId)
  ),

  on(actions.resetPaymentInput, () => paymentInputInitialState),

  on(actions.cancelPaymentInputRequest, (state, action) =>
    asyncStoreItemAdapter.resolveRequest(state, action.requestId)
  ),

  on(actions.failPaymentInput, (state, payload) => asyncStoreItemAdapter.failRequest(state, payload.requestId)),

  on(actions.setPaymentInputFromApi, actions.updatePaymentInputFromApi, (state, payload) =>
    asyncStoreItemAdapter.addRequest(state, payload.requestId)
  ),
];

/**
 * PaymentInput Store reducer
 */
export const paymentInputReducer = createReducer(paymentInputInitialState, ...paymentInputReducerFeatures);
