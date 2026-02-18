import { ActionCreator, createReducer, on, ReducerTypes } from '@ngrx/store';
import * as actions from './asw-service.actions';
import { AswServiceState } from './asw-service.state';

/**
 * aswService initial state
 */
export const aswServiceInitialState: AswServiceState = {
  // empty init
};

/**
 * List of basic actions for AswService Store
 */
export const aswServiceReducerFeatures: ReducerTypes<AswServiceState, ActionCreator[]>[] = [
  on(actions.setAswService, (_state, payload) => ({ ...payload })),

  on(actions.updateAswService, (state, payload) => ({ ...state, ...payload })),

  on(actions.resetAswService, () => aswServiceInitialState),
];

/**
 * AswService Store reducer
 */
export const aswServiceReducer = createReducer(aswServiceInitialState, ...aswServiceReducerFeatures);
