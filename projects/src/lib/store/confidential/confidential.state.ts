import { InitializationResponseDataConfidential } from 'src/sdk-initialization';

/**
 * Confidential model
 */
export interface ConfidentialModel extends InitializationResponseDataConfidential {}

/**
 * Confidential model details
 */
export interface ConfidentialStateDetails extends ConfidentialModel {}

/**
 * Confidential store state
 */
export interface ConfidentialState extends ConfidentialStateDetails, ConfidentialModel {}

/**
 * Name of the Confidential Store
 */
export const CONFIDENTIAL_STORE_NAME = 'confidential';

/**
 * Confidential Store Interface
 */
export interface ConfidentialStore {
  /** Confidential state */
  [CONFIDENTIAL_STORE_NAME]: ConfidentialState;
}
