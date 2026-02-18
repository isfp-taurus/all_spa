import { ActionCreator, createReducer, on, ReducerTypes } from '@ngrx/store';
import * as actions from './notification.actions';
import { NotificationState } from './notification.state';

/**
 * notification initial state
 */
export const notificationInitialState: NotificationState = {
  assertMessage: '',
  politeMessage: '',
};

/**
 * List of basic actions for Notification Store
 */
export const notificationReducerFeatures: ReducerTypes<NotificationState, ActionCreator[]>[] = [
  on(actions.setNotification, (_state, payload) => ({ ...payload })),

  on(actions.updateNotification, (state, payload) => ({ ...state, ...payload })),

  on(actions.resetNotification, () => notificationInitialState),
];

/**
 * Notification Store reducer
 */
export const notificationReducer = createReducer(notificationInitialState, ...notificationReducerFeatures);
