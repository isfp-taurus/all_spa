import { SupportInformationInputModel } from '@common/interfaces';

/**
 * SupportInformationInput store state
 */
export interface SupportInformationInputState extends SupportInformationInputModel {}

/**
 * Name of the SupportInformationInput Store
 */
export const SUPPORT_INFORMATION_INPUT_STORE_NAME = 'supportInformationInput';

/**
 * SupportInformationInput Store Interface
 */
export interface SupportInformationInputStore {
  /** SupportInformationInput state */
  [SUPPORT_INFORMATION_INPUT_STORE_NAME]: SupportInformationInputState;
}
