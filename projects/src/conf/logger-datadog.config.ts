import { DataDogCustomConfig } from '@lib/services';

/**
 * Datadog（ログ）構成
 *
 * @see {@link DataDogCustomConfig}
 */
export const DATADOG_CONFIG: DataDogCustomConfig = {
  // FIXME: 各APPごとに指定する
  service: 'all:ado:spa:reservation',
  replaceRules: {
    // パスワード：全桁をマスクする
    password: ['.', '*'],
    // 提携追加: Cardinalの返却値のマスキング対象5項目
    AuthorizationPayload: ['.', '*'],
    CAVV: ['.', '*'],
    ECIFlag: ['.', '*'],
    PAResStatus: ['.', '*'],
    SignatureVerification: ['.', '*'],
  },
};
