import { createAction, props } from '@ngrx/store';
import { NotificationState } from './notification.state';

/** StateDetailsActions */
const ACTION_SET = '[Notification] set';
const ACTION_UPDATE = '[Notification] update';
const ACTION_RESET = '[Notification] reset';

/**
 * Clear the current store object and replace it with the new one
 */
export const setNotification = createAction(ACTION_SET, props<NotificationState>());

/**
 * Change a part or the whole object in the store.
 */
export const updateNotification = createAction(ACTION_UPDATE, props<Partial<NotificationState>>());

/**
 * Clear the whole state, return to the initial one
 */
export const resetNotification = createAction(ACTION_RESET);
