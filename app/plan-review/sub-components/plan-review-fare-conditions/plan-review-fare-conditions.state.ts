/**
 * 運賃ルールパーツにて読み込むキャッシュ
 * @param lang 言語キー
 * @returns
 */
export function getPlanReviewFareConditionsMasterKey(lang: string) {
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
      key: 'FareFullRule_All',
      fileName: 'FareFullRule_All',
    },
    {
      key: 'FfPriorityCode_I18nJoin_ByFfPriorityCode' + `_${lang}`,
      fileName: 'FfPriorityCode_I18nJoin_ByFfPriorityCode' + `_${lang}`,
    },
  ];
}
