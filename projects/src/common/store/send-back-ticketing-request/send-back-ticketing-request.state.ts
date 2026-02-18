import { AsyncStoreItem } from '@lib/store';
import { OrdersAnaBizSendBackTicketingRequestResponse } from 'src/sdk-reservation';

/**
 * SendBackTicketingRequest model
 */
export interface SendBackTicketingRequestModel extends OrdersAnaBizSendBackTicketingRequestResponse {}

/**
 * SendBackTicketingRequest model details
 */
export interface SendBackTicketingRequestStateDetails extends AsyncStoreItem {}

/**
 * SendBackTicketingRequest store state
 */
export interface SendBackTicketingRequestState
  extends SendBackTicketingRequestStateDetails,
    SendBackTicketingRequestModel {}

/**
 * Name of the SendBackTicketingRequest Store
 */
export const SEND_BACK_TICKETING_REQUEST_STORE_NAME = 'sendBackTicketingRequest';

/**
 * SendBackTicketingRequest Store Interface
 */
export interface SendBackTicketingRequestStore {
  /** SendBackTicketingRequest state */
  [SEND_BACK_TICKETING_REQUEST_STORE_NAME]: SendBackTicketingRequestState;
}
