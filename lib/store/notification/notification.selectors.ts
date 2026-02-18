import { createFeatureSelector } from '@ngrx/store';
import { NOTIFICATION_STORE_NAME, NotificationState } from './notification.state';

/** Select Notification State */
export const selectNotificationState = createFeatureSelector<NotificationState>(NOTIFICATION_STORE_NAME);
