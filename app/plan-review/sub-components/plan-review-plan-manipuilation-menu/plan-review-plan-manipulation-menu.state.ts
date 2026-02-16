/**
 * 見積(PDF)作成APIリクエスト作成用に読み込むキャッシュ
 * @param lang 言語キー
 * @returns
 */
export function getPlanReviewGetEstimationRequestMasterKey(lang: string) {
  return [
    {
      key: 'mAirportI18NList' + `_${lang}`,
      fileName: 'm_airport_i18n' + '/' + lang,
    },
    {
      key: 'm_airline_i18n' + `_${lang}`,
      fileName: 'm_airline_i18n' + '/' + lang,
    },
    {
      key: 'ListData_All',
      fileName: 'ListData_All',
    },
    {
      key: 'Tax_All_Lang',
      fileName: 'Tax_All_Lang',
    },
    {
      key: 'm_ff_priority_code_i18n' + `_${lang}`,
      fileName: 'm_ff_priority_code_i18n' + '/' + lang,
    },
    {
      key: 'airport_all',
      fileName: 'Airport_All',
    },
  ];
}

/**
 * 搭乗者種別(PTC)毎の静的文言キー
 */
export const travelerTypeStaticMsgs: { [key: string]: string } = {
  ADT: 'label.adult',
  B15: 'label.youngAdult',
  CHD: 'label.child',
  INF: 'label.infant',
};

/**
 * 搭乗者種別(PTC)毎の人数用静的文言キー
 */
export const travelerNumStaticMsgs: { [key: string]: string } = {
  ADT: 'label.passengerAdult',
  B15: 'label.passengerYoungAdult',
  CHD: 'label.passengerChild',
  INF: 'label.passengerInfant',
};
