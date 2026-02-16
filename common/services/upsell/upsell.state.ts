/**
 * アップセル情報作成用に読み込むキャッシュ
 * @param lang 言語キー
 * @returns キャッシュの配列
 */
export function getUpsellServiceMasterKey(lang: string) {
  return [
    {
      key: 'mAirportI18NList' + `_${lang}`,
      fileName: 'm_airport_i18n' + '/' + lang,
    },
    {
      key: 'm_ff_priority_code_i18n' + `_${lang}`,
      fileName: 'm_ff_priority_code_i18n' + '/' + lang,
    },
    {
      key: 'LangCodeConvert_All',
      fileName: 'LangCodeConvert_All',
    },
  ];
}
