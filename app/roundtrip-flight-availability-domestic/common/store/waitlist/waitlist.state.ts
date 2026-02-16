import { WaitlistGetSearchWaitlistResponse } from '@app/roundtrip-flight-availability-domestic/common/sdk';
import { AsyncStoreItem } from '@lib/store';

/**
 * Waitlist model
 */
export interface WaitlistModel {
  model: WaitlistGetSearchWaitlistResponse | null;
  requestId?: string;
}

/**
 * WaitlistGetSearchWaitlistResponse model details
 */
export interface WaitlistStateDetails extends AsyncStoreItem {}

/**
 * Waitlist store state
 */
export interface WaitlistState extends WaitlistStateDetails, WaitlistModel {}

/**
 * Name of the Waitlist Store
 */
export const WAITLIST_STORE_NAME = 'waitlist';

/**
 * Waitlist Store Interface
 */
export interface WaitlistStore {
  /** Waitlist state */
  [WAITLIST_STORE_NAME]: WaitlistState;
}
