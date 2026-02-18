/**
 * Notification model
 *
 * @param assertMessage aria-live="assertive"に設定する読み上げ文言
 * @param politeMessage aria-live="polite"に設定する読み上げ文言
 *
 */
export interface NotificationModel {
  assertMessage: string;
  politeMessage: string;
}

/**
 * Notification store state
 */
export interface NotificationState extends NotificationModel {}

/**
 * Name of the Notification Store
 */
export const NOTIFICATION_STORE_NAME = 'notification';

/**
 * Notification Store Interface
 */
export interface NotificationStore {
  /** Notification state */
  [NOTIFICATION_STORE_NAME]: NotificationState;
}
