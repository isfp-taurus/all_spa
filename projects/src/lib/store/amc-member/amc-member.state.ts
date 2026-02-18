import { AMCMemberModel } from '../../interfaces';

/**
 * AMCMember store state
 */
export interface AMCMemberState extends AMCMemberModel {}

/**
 * Name of the AMCMember Store
 */
export const AMC_MEMBER_STORE_NAME = 'amcMember';

/**
 * AMCMember Store Interface
 */
export interface AMCMemberStore {
  /** AMCMember state */
  [AMC_MEMBER_STORE_NAME]: AMCMemberState;
}
