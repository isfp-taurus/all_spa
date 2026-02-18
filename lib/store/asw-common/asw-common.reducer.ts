import { ActionCreator, createReducer, on, ReducerTypes } from '@ngrx/store';
import * as actions from './asw-common.actions';
import { AswCommonState } from './asw-common.state';

/**
 * aswCommon initial state
 */
export const aswCommonInitialState: AswCommonState = {
  // initial is empty
};

/**
 * List of basic actions for AswCommon Store
 */
export const aswCommonReducerFeatures: ReducerTypes<AswCommonState, ActionCreator[]>[] = [
  on(actions.setAswCommon, (_state, payload) => ({ ...payload })),

  on(actions.updateAswCommon, (state, payload) => ({ ...state, ...payload })),

  on(actions.resetAswCommon, () => aswCommonInitialState),
];

/**
 * AswCommon Store reducer
 */
export const aswCommonReducer = createReducer(aswCommonInitialState, ...aswCommonReducerFeatures);
