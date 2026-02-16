/**
 * セッションストレージ保持項目
 *
 * @param ACCESS_TOKEN アクセストークン
 * @param X_CORRELATION_ID ユニークID
 * @param IDENTIFICATION_ID ASWユーザID
 * @param JSESSION_ID jSessionId
 * @param ASW_SERVICE サービス共通情報
 *
 */
export const SessionStorageName = {
  ACCESS_TOKEN: 'accessToken',
  X_CORRELATION_ID: 'xCorrelationId',
  IDENTIFICATION_ID: 'identificationId',
  JSESSION_ID: 'jSessionId',
  RETURN_URL: 'returnUrl',
  ASW_SERVICE: 'aswService',
};
