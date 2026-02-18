import { AlertMessageItem } from '../../interfaces';

/**
 * AlertMessage store state
 * @param warningMessage ワーニング情報 @see AlertMessageItem
 * @param infomationMessage インフォメーション情報 @see AlertMessageItem
 * @param subWarningMessage モーダルワーニング情報 @see AlertMessageItem
 * @param subInfomationMessage モーダルインフォメーション情報 @see AlertMessageItem
 */
export interface AlertMessageState {
  warningMessage: AlertMessageItem[];
  infomationMessage: AlertMessageItem[];
  subWarningMessage: AlertMessageItem[];
  subInfomationMessage: AlertMessageItem[];
}

/**
 * Name of the AlertMessage Store
 */
export const ALERT_MESSAGE_STORE_NAME = 'alertMessage';

/**
 * AlertMessage Store Interface
 */
export interface AlertMessageStore {
  /** AlertMessage state */
  [ALERT_MESSAGE_STORE_NAME]: AlertMessageState;
}
