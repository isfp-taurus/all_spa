import { AppInfoModel } from '../../interfaces';

/**
 * AppInfo store state
 */
export interface AppInfoState extends AppInfoModel {}

/**
 * Name of the AppInfo Store
 */
export const APP_INFO_STORE_NAME = 'appInfo';

/**
 * AppInfo Store Interface
 */
export interface AppInfoStore {
  /** AppInfo state */
  [APP_INFO_STORE_NAME]: AppInfoState;
}
