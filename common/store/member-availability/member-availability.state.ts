import { AsyncStoreItem } from '@lib/store';
import { MemberAvailabilityResponse } from 'src/sdk-member';

/**
 * MemberAvailability model
 */
export interface MemberAvailabilityModel {
  model: MemberAvailabilityResponse | null;
}

/**
 * MemberAvailabilityResponse model details
 */
export interface MemberAvailabilityStateDetails extends AsyncStoreItem {}

/**
 * MemberAvailability store state
 */
export interface MemberAvailabilityState extends MemberAvailabilityStateDetails, MemberAvailabilityModel {}

/**
 * Name of the MemberAvailability Store
 */
export const MEMBER_AVAILABILITY_STORE_NAME = 'memberAvailability';

/**
 * MemberAvailability Store Interface
 */
export interface MemberAvailabilityStore {
  /** MemberAvailability state */
  [MEMBER_AVAILABILITY_STORE_NAME]: MemberAvailabilityState;
}
