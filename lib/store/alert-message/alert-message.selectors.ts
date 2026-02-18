import { createFeatureSelector } from '@ngrx/store';
import { ALERT_MESSAGE_STORE_NAME, AlertMessageState } from './alert-message.state';

/** Select AlertMessage State */
export const selectAlertMessageState = createFeatureSelector<AlertMessageState>(ALERT_MESSAGE_STORE_NAME);
