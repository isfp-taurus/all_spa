/**
 * 言語切り替え用Configの言語の詳細
 */
export interface LanguageDetail {
  value: string;
  label: string;
}

/**
 * 言語切り替え用Config
 */
export interface LanguageSwitchConfig {
  [key: string]: LanguageDetail;
}

/**
 * 言語切り替え用Configの定義
 */
export const DEBUG_LANGUAGE_SWITCH_CONFIG: LanguageSwitchConfig = {
  debug_language_ja: {
    value: 'ja',
    label: '日本語',
  },
  debug_language_en: {
    value: 'en',
    label: '英語',
  },
};
