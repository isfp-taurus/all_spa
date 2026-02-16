import { createFeatureSelector } from '@ngrx/store';
import { APP_INFO_STORE_NAME, AppInfoState } from './app-info.state';

/** Select AppInfo State */
export const selectAppInfoState = createFeatureSelector<AppInfoState>(APP_INFO_STORE_NAME);
