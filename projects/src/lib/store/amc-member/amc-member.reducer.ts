import { ActionCreator, createReducer, on, ReducerTypes } from '@ngrx/store';
import { GenderCodeType, MemberKindCodeType, PremiumStatusCodeType, TierLevelType } from '../../interfaces';
import * as actions from './amc-member.actions';
import { AMCMemberState } from './amc-member.state';

/**
 * amcMember initial state
 */
export const amcMemberInitialState: AMCMemberState = {
  amcNumber: '',
  memberKindCode: MemberKindCodeType.UNKNOWN,
  cardStatusCode: '',
  letterName: '',
  alteaName: {
    lastName: '',
    firstName: '',
  },
  gender: GenderCodeType.UNKNOWN,
  mileBalance: 0,
  premiumStatus: PremiumStatusCodeType.UNKNOWN,
  afaPrimeMemberIdentification: '',
  upgradePointBalanceThisYear: 0,
  upgradePointBalanceNextYear: 0,
  mileBalanceAfa: 0,
  premiumPointTotal: 0,
  premiumPointAnaTotal: 0,
  skyCoinBalance: 0,
  tierLevel: TierLevelType.UNKNOWN,
  bookDate: '',
  anaCardTypeCode: '',
};

/**
 * List of basic actions for AMCMember Store
 */
export const amcMemberReducerFeatures: ReducerTypes<AMCMemberState, ActionCreator[]>[] = [
  on(actions.setAMCMember, (_state, payload) => ({ ...payload })),

  on(actions.updateAMCMember, (state, payload) => ({ ...state, ...payload })),

  on(actions.resetAMCMember, () => amcMemberInitialState),
];

/**
 * AMCMember Store reducer
 */
export const amcMemberReducer = createReducer(amcMemberInitialState, ...amcMemberReducerFeatures);
