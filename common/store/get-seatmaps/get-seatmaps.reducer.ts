import { ActionCreator, ReducerTypes, createReducer, on } from '@ngrx/store';
import { SeatmapsState } from './get-seatmaps.state';
import {
  cancelGettingSeatmaps,
  failGettingSeatmaps,
  resetSeatmaps,
  setSeatmaps,
  setSeatmapsFromApi,
} from './get-seatmaps.actions';
import { asyncStoreItemAdapter } from '@lib/store';

export const seatmapsInitialState: SeatmapsState = {
  requestIds: [],
};

export const seatmapsReducerFeature: ReducerTypes<SeatmapsState, ActionCreator[]>[] = [
  on(setSeatmaps, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest(
      { ...asyncStoreItemAdapter.extractAsyncStoreItem(state), ...payload },
      payload.requestId
    )
  ),
  on(resetSeatmaps, () => seatmapsInitialState),
  on(cancelGettingSeatmaps, (state, action) => asyncStoreItemAdapter.resolveRequest(state, action.requestId)),
  on(failGettingSeatmaps, (state, payload) => asyncStoreItemAdapter.failRequest(state, payload.requestId)),
  on(setSeatmapsFromApi, (state, payload) => asyncStoreItemAdapter.addRequest(state, payload.requestId)),
];

export const seatmapsReducer = createReducer(seatmapsInitialState, ...seatmapsReducerFeature);
