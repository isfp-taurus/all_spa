import { ActionCreator, createReducer, on, ReducerTypes } from '@ngrx/store';
import * as actions from './asw-master.actions';
import { AswMasterState } from './asw-master.state';

/**
 * aswMaster initial state
 */
export const aswMasterInitialState: AswMasterState = {
  // initial empty
};

/**
 * List of basic actions for AswMaster Store
 */
export const aswMasterReducerFeatures: ReducerTypes<AswMasterState, ActionCreator[]>[] = [
  on(actions.setAswMaster, (_state, payload) => ({ ...payload })),

  on(actions.updateAswMaster, (state, payload) => ({ ...state, ...payload })),

  on(actions.resetAswMaster, () => aswMasterInitialState),
];

/**
 * AswMaster Store reducer
 */
export const aswMasterReducer = createReducer(aswMasterInitialState, ...aswMasterReducerFeatures);
