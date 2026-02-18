import { environment } from '@env/environment';
import { I18nConfig } from '@lib/interfaces';

/**
 * i18n（国際化対応）構成
 */

const localTestList =
  environment.envName === 'local'
    ? [
        {
          prefix: 'hello_world/',
        },
        {
          prefix: 'test/',
        },
      ]
    : [];

export const I18N_CONFIG: I18nConfig = {
  // サポート可能な言語定義
  supportedLocales: {
    ja: 'ja', // 日本語
    en: 'en', // 英語
  },
  // デフォルト言語
  defaultLanguage: 'ja',
  // ロードするファイルのリスト
  // FIXME: 各APPごとに指定する
  loadFileList: [
    ...localTestList,
    {
      prefix: 'm_static_message/',
    },
    {
      prefix: 'm_error_message/',
    },
    {
      prefix: 'm_dynamic_message/',
    },
    {
      prefix: 'm_list_data/',
    },
    {
      prefix: 'm_country_i18n/',
    },
    {
      prefix: 'm_service_contents_i18n/',
    },
    {
      prefix: 'm_ff_priority_code_i18n/',
    },
    {
      prefix: 'm_list_data/',
    },
    {
      prefix: 'm_country_i18n/',
    },
    {
      prefix: 'm_airport_i18n/',
    },
    {
      prefix: 'm_airline_i18n/',
    },
  ],
};
