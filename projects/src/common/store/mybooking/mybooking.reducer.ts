import { ActionCreator, createReducer, on, ReducerTypes } from '@ngrx/store';
import * as actions from './mybooking.actions';
import { MyBookingState } from './mybooking.state';

/**
 * MyBooking initial state
 */
export const myBookingInitialState: MyBookingState = {
  myBooking: {},
  myBookingService: {},
};

/**
 * List of basic actions for MyBooking Store
 */
export const myBookingReducerFeatures: ReducerTypes<MyBookingState, ActionCreator[]>[] = [
  on(actions.setMyBooking, (state, payload) => ({ ...payload })),

  on(actions.updateMyBooking, (state, payload) => ({ ...state, ...payload })),

  on(actions.resetMyBooking, () => myBookingInitialState),
];

/**
 * MyBooking Store reducer
 */
export const myBookingReducer = createReducer(myBookingInitialState, ...myBookingReducerFeatures);
