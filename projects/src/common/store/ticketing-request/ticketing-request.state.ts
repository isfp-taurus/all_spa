import { AsyncStoreItem } from '@lib/store';
import { OrdersAnaBizTicketingRequestResponse } from 'src/sdk-reservation';

/**
 * TicketingRequest model
 */
export interface TicketingRequestModel extends OrdersAnaBizTicketingRequestResponse {}

/**
 * TicketingRequest model details
 */
export interface TicketingRequestStateDetails extends AsyncStoreItem {}

/**
 * TicketingRequest store state
 */
export interface TicketingRequestState extends TicketingRequestStateDetails, TicketingRequestModel {}

/**
 * Name of the TicketingRequest Store
 */
export const TICKETING_REQUEST_STORE_NAME = 'ticketingRequest';

/**
 * TicketingRequest Store Interface
 */
export interface TicketingRequestStore {
  /** TicketingRequest state */
  [TICKETING_REQUEST_STORE_NAME]: TicketingRequestState;
}
