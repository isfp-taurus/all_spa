import { AsyncStoreItem } from '@lib/store';
import { GetETicketItineraryReceiptResponse } from 'src/sdk-servicing';

/**
 * GetETicketItineraryReceipt model
 */
export interface GetETicketItineraryReceiptModel extends GetETicketItineraryReceiptResponse {}

/**
 * GetETicketItineraryReceiptResponse model details
 */
export interface GetETicketItineraryReceiptStateDetails extends AsyncStoreItem, GetETicketItineraryReceiptModel {}

/**
 * GetETicketItineraryReceipt store state
 */
export interface GetETicketItineraryReceiptState
  extends GetETicketItineraryReceiptStateDetails,
    GetETicketItineraryReceiptModel {}

/**
 * Name of the GetETicketItineraryReceipt Store
 */
export const GET_E_TICKET_ITINERARY_RECEIPT_STORE_NAME = 'getETicketItineraryReceipt';

/**
 * GetETicketItineraryReceipt Store Interface
 */
export interface GetETicketItineraryReceiptStore {
  /** GetETicketItineraryReceipt state */
  [GET_E_TICKET_ITINERARY_RECEIPT_STORE_NAME]: GetETicketItineraryReceiptState;
}
