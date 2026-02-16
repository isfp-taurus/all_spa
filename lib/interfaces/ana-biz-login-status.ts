/**
 * ANA Bizログインステータス
 *
 * @param NOT_LOGIN 未ログイン
 *
 */
export type AnaBizLoginStatusType = (typeof AnaBizLoginStatusType)[keyof typeof AnaBizLoginStatusType];
export const AnaBizLoginStatusType = {
  LOGIN: 'LOGIN',
  ORGANIZATION_SELECT_REQUIRED: 'ORGANIZATION_SELECT_REQUIRED',
  NOT_LOGIN: 'NOT_LOGIN',
  UNKNOWN: '',
} as const;
