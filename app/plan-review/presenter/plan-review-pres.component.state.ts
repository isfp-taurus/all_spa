import {
  AirlineI18nJoinAll,
  EquipmentI18nJoinPk,
  MLangCodeConvert,
  MListData,
  MMileageProgram,
  MServiceContentsI18N,
  MSpecialMeal,
  PreorderMealFlightAllData,
  ServiceContentsByItineraryType,
} from '@common/interfaces';

/**
 * 処理待ち対象コンポーネント識別子定義
 */
export type PlanReviewWaitedComponentId =
  (typeof PlanReviewWaitedComponentId)[keyof typeof PlanReviewWaitedComponentId];
export const PlanReviewWaitedComponentId = {
  PRES: 'pres',
  TRIP_SUMMARY: 'tripSummary',
  PASSENGER_INFO: 'passengerInfo',
  PAYMENT_SUMMARY: 'paymentSummary',
} as const;

/**
 * 処理待ち対象コンポーネント識別子リスト
 */
export const planReviewWaitedComponentList = [
  PlanReviewWaitedComponentId.PRES,
  PlanReviewWaitedComponentId.TRIP_SUMMARY,
  PlanReviewWaitedComponentId.PASSENGER_INFO,
  PlanReviewWaitedComponentId.PAYMENT_SUMMARY,
];

/**
 * presコンポーネントにて読み込むキャッシュ
 * @param lang 言語キー
 * @returns
 */
export function getPlanReviewPresMasterKey(lang: string) {
  const langSuffix = `_${lang}`;
  return [
    {
      key: 'mAirportI18NList' + langSuffix,
      fileName: 'm_airport_i18n' + '/' + lang,
    },
    {
      key: 'Airline_I18nJoinAll',
      fileName: 'Airline_I18nJoinAll' + langSuffix,
    },
    {
      key: 'Equipment_I18nJoin_Pk' + langSuffix,
      fileName: 'Equipment_I18nJoin_Pk' + langSuffix,
    },
    {
      key: 'm_service_contents_i18n' + langSuffix,
      fileName: 'm_service_contents_i18n' + '/' + lang,
    },
    {
      key: 'ListData_All',
      fileName: 'ListData_All',
    },
    {
      key: 'm_mileage_program_i18n_all',
      fileName: 'm_mileage_program_i18n_all' + langSuffix,
    },
    {
      key: 'M_SPECIAL_MEAL' + langSuffix,
      fileName: 'M_SPECIAL_MEAL' + langSuffix,
    },
    {
      key: 'Preorder_Meal_Flight_All',
      fileName: 'Preorder_Meal_Flight_All',
    },
    {
      key: 'm_ff_priority_code_i18n' + langSuffix,
      fileName: 'm_ff_priority_code_i18n' + '/' + lang,
    },
    {
      key: 'langCodeConvert_All',
      fileName: 'LangCodeConvert_All',
    },
  ];
}

export interface PlanReviewPresMasterData {
  airport: { [key: string]: string };
  airline: AirlineI18nJoinAll;
  equipmentPk: EquipmentI18nJoinPk;
  serviceDescription: MServiceContentsI18N;
  listDataAll: Array<MListData>;
  mileage: Array<MMileageProgram>;
  specialMeal: Array<MSpecialMeal>;
  preorderMeal: Array<PreorderMealFlightAllData>;
  ffPriorityCode: { [key: string]: string };
  langCodeConvert: Array<MLangCodeConvert>;
}
