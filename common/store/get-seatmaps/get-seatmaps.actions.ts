import { AsyncRequest, FromApiActionPayload, WithRequestId, asyncProps } from '@lib/store';
import { createAction, props } from '@ngrx/store';
import { SeatmapsModel } from './get-seatmaps.state';

const ACTION_SET = '[Seatmaps] set';
const ACTION_FAIL = '[Seatmaps] fail';
const ACTION_SET_FROM_API = '[Seatmaps] set from api';
const ACTION_CANCEL_REQUEST = '[Seatmaps] cancel request';
const ACTION_RESET = '[Seatmaps] reset';

export const setSeatmaps = createAction(ACTION_SET, props<WithRequestId<SeatmapsModel>>());
export const failGettingSeatmaps = createAction(ACTION_FAIL, asyncProps<WithRequestId<{ error: any }>>());
export const setSeatmapsFromApi = createAction(ACTION_SET_FROM_API, asyncProps<FromApiActionPayload<SeatmapsModel>>());
export const cancelGettingSeatmaps = createAction(ACTION_CANCEL_REQUEST, props<AsyncRequest>());
export const resetSeatmaps = createAction(ACTION_RESET);
