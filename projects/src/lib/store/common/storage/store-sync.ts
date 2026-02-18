import { Action } from '@ngrx/store';
import { rehydrateApplicationState, syncStateUpdate } from 'ngrx-store-localstorage';

import { Serializer } from '../types';

/**
 * Format of a key in `StoreSyncConfig`
 */
export interface StoreSyncSerializers {
  [storeName: string]: Serializer<any>;
}

/**
 * An interface defining the configuration attributes to bootstrap `storeSyncMetaReducer`
 */
export interface StoreSyncConfig {
  /** State keys to sync with storage */
  keys: StoreSyncSerializers[];
  /** Pull initial state from storage on startup */
  rehydrate?: boolean;
  /** Specify an object that conforms to the Storage interface to use, this will default to localStorage */
  storage?: Storage;
  /** When set, sync to storage will only occur when this function returns a true boolean */
  syncCondition?: (state: any) => any;
}

const INIT_ACTION = '@ngrx/store/init';
const UPDATE_ACTION = '@ngrx/store/update-reducers';

/**
 * Provide state (reducer) keys to sync with storage
 *
 * @param config
 * @returns a meta reducer
 */
export const storeSyncMetaReducer = (config: StoreSyncConfig) => (reducer: any) => {
  const defaultSerializer = (key: string) => key;
  if (config.storage === undefined) {
    config.storage = localStorage || window.localStorage;
  }

  const stateKeys = [...config.keys];

  // restoreDates should be set to false to prevent restoring serialized date objects
  const rehydratedState = config.rehydrate
    ? rehydrateApplicationState(stateKeys, config.storage, defaultSerializer, false)
    : undefined;

  return (state: any, action: Action) => {
    let nextState: any;

    // If state arrives undefined, we need to let it through the supplied reducer
    // in order to get a complete state as defined by user
    if ((action.type === INIT_ACTION || action.type === UPDATE_ACTION) && !state) {
      nextState = reducer(state, action);
    } else {
      nextState = { ...state };
    }

    if ((action.type === INIT_ACTION || action.type === UPDATE_ACTION) && rehydratedState) {
      nextState = {
        ...nextState,
        ...rehydratedState,
      };
    }

    nextState = reducer(nextState, action);

    if (action.type !== INIT_ACTION) {
      syncStateUpdate(
        nextState,
        stateKeys,
        config.storage!,
        defaultSerializer as (key: string | number) => string,
        false,
        config.syncCondition
      );
    }

    return nextState;
  };
};
