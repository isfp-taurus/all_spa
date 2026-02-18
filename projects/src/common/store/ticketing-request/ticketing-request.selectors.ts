import { createFeatureSelector, createSelector } from '@ngrx/store';
import { TICKETING_REQUEST_STORE_NAME, TicketingRequestState } from './ticketing-request.state';

/** Select TicketingRequest State */
export const selectTicketingRequestState = createFeatureSelector<TicketingRequestState>(TICKETING_REQUEST_STORE_NAME);

/** Select TicketingRequest isPending status */
export const selectTicketingRequestIsPendingStatus = createSelector(
  selectTicketingRequestState,
  (state) => !!state.isPending
);

/** Select TicketingRequest isFailure status */
export const selectTicketingRequestIsFailureStatus = createSelector(
  selectTicketingRequestState,
  (state) => !!state.isFailure
);
