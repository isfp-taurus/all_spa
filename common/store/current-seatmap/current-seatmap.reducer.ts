import { ActionCreator, createReducer, on, ReducerTypes } from '@ngrx/store';
import * as actions from './current-seatmap.actions';
import { CurrentSeatmapState } from './current-seatmap.state';
import {
  initSeatmapStoreModelRetrieveField,
  SeatmapStoreModelRetrieveField,
} from '../../interfaces/reservation/current-seatmap/seatmap-store-model-retrieve-field';

/**
 * currentSeatmap initial state
 */
export const currentSeatmapInitialState: CurrentSeatmapState = { retrieve: {} };

/**
 * List of basic actions for CurrentSeatmap Store
 */
export const currentSeatmapReducerFeatures: ReducerTypes<CurrentSeatmapState, ActionCreator[]>[] = [
  on(actions.setCurrentSeatmap, (_state, payload) => ({ ...payload })),

  on(actions.updateCurrentSeatmap, (state, payload) => ({ ...state, ...payload })),

  on(actions.resetCurrentSeatmap, () => currentSeatmapInitialState),

  on(actions.retrieveCurrentSeatmap, (state) => ({ ...state, ...state.retrieve })),

  on(actions.preserveCurrentSeatmap, (state) => {
    return {
      ...state,
      retrieve: subset(state, Object.keys(initSeatmapStoreModelRetrieveField()) as (keyof CurrentSeatmapState)[]),
    };
  }),
];

function subset<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  return Object.fromEntries(Object.entries(obj).filter(([k, _]) => keys.includes(k as K))) as Pick<T, K>;
}

/**
 * CurrentSeatmap Store reducer
 */
export const currentSeatmapReducer = createReducer(currentSeatmapInitialState, ...currentSeatmapReducerFeatures);
