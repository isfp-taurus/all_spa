import { ActionCreator, createReducer, on, ReducerTypes } from '@ngrx/store';
import * as actions from './support-information-input.actions';
import { SupportInformationInputState } from './support-information-input.state';

/**
 * supportInformationInput initial state
 */
export const supportInformationInputInitialState: SupportInformationInputState = {
  specialAssistance: {
    degreeOfWalking: false,
    blind: false,
    deaf: false,
    pregnant: false,
  },
  walkingAbility: {
    code: '',
  },
  wheelchairs: {},
  foldingType: {
    depth: 0,
    width: 0,
    height: 0,
    weight: 0,
  },
  wheelchairType: {
    type: '',
    batteryType: '',
  },
  pregnant: {
    doctorName: '',
    doctorCountryPhoneExtension: '',
    doctorPhoneNumber: '',
    pregnantDueDate: undefined,
    pregnantCondition: '',
  },
};

/**
 * List of basic actions for SupportInformationInput Store
 */
export const supportInformationInputReducerFeatures: ReducerTypes<SupportInformationInputState, ActionCreator[]>[] = [
  on(actions.setSupportInformationInput, (_state, payload) => ({ ...payload })),

  on(actions.updateSupportInformationInput, (state, payload) => ({ ...state, ...payload })),

  on(actions.resetSupportInformationInput, () => supportInformationInputInitialState),
];

/**
 * SupportInformationInput Store reducer
 */
export const supportInformationInputReducer = createReducer(
  supportInformationInputInitialState,
  ...supportInformationInputReducerFeatures
);
