import { createFeatureSelector, createSelector } from '@ngrx/store';
import {
  SEND_BACK_TICKETING_REQUEST_STORE_NAME,
  SendBackTicketingRequestState,
} from './send-back-ticketing-request.state';

/** Select SendBackTicketingRequest State */
export const selectSendBackTicketingRequestState = createFeatureSelector<SendBackTicketingRequestState>(
  SEND_BACK_TICKETING_REQUEST_STORE_NAME
);

/** Select SendBackTicketingRequest isPending status */
export const selectSendBackTicketingRequestIsPendingStatus = createSelector(
  selectSendBackTicketingRequestState,
  (state) => !!state.isPending
);

/** Select SendBackTicketingRequest isFailure status */
export const selectSendBackTicketingRequestIsFailureStatus = createSelector(
  selectSendBackTicketingRequestState,
  (state) => !!state.isFailure
);
