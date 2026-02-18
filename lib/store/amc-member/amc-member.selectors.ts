import { createFeatureSelector } from '@ngrx/store';
import { AMC_MEMBER_STORE_NAME, AMCMemberState } from './amc-member.state';

/** Select AMCMember State */
export const selectAMCMemberState = createFeatureSelector<AMCMemberState>(AMC_MEMBER_STORE_NAME);
