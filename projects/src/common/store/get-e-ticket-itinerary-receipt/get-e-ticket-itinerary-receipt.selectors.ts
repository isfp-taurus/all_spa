import { createFeatureSelector, createSelector } from '@ngrx/store';
import {
  GET_E_TICKET_ITINERARY_RECEIPT_STORE_NAME,
  GetETicketItineraryReceiptState,
} from './get-e-ticket-itinerary-receipt.state';

/** Select GetETicketItineraryReceipt State */
export const selectGetETicketItineraryReceiptState = createFeatureSelector<GetETicketItineraryReceiptState>(
  GET_E_TICKET_ITINERARY_RECEIPT_STORE_NAME
);

/** Select GetETicketItineraryReceipt isPending status */
export const selectGetETicketItineraryReceiptIsPendingStatus = createSelector(
  selectGetETicketItineraryReceiptState,
  (state) => !!state.isPending
);

/** Select GetETicketItineraryReceipt isFailure status */
export const selectGetETicketItineraryReceiptIsFailureStatus = createSelector(
  selectGetETicketItineraryReceiptState,
  (state) => !!state.isFailure
);
