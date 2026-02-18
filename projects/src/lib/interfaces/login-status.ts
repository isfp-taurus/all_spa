/**
 * ログインステータス
 *
 * @param REAL_LOGIN リアルログイン
 * @param TEMPORARY_LOGIN 仮ログイン
 * @param NOT_LOGIN 未ログイン
 * @param UNKNOWN 不明
 *
 */
export type LoginStatusType = (typeof LoginStatusType)[keyof typeof LoginStatusType];
export const LoginStatusType = {
  REAL_LOGIN: 'REAL_LOGIN',
  TEMPORARY_LOGIN: 'TEMPORARY_LOGIN',
  NOT_LOGIN: 'NOT_LOGIN',
  UNKNOWN: '',
} as const;
