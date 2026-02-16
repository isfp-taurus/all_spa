import { LoadAswMasterInfo } from '@lib/interfaces';
import { I18N_CONFIG } from './i18n.config';

// FIXME: 各APPごとに必要に応じて指定する

/** 汎用データマスタキャッシュJSONデータのStoreに保存する際の共通キー */
const LISTDATA_COMMON_STORE_KEY = 'listData_pd_' as const;

/**
 * マスタキャッシュJSONデータのStoreに保存する際のキー
 */
export const MasterStoreKey = {
  /** プロパティマスタ_全リスト */
  PROPERTY: 'property',
  /** DxAPIエラーコード対応マスタ_全リスト */
  DXAPI_ERROR_CODE: 'dxapiErrorCode',
  /** iFlyエラーコード対応マスタ_エラーメッセージ */
  IFLY_ERROR_CODE_ERRORMESSAGE: 'IflyErrorCode_ErrorMessage',
  /** 運用確認メッセージ_全リスト */
  OPERATION_CONFIRM_LOG: 'operationConfirmLog',
  /** Tealium連携用画面名 */
  LISTDATA_PD_001: `${LISTDATA_COMMON_STORE_KEY}001`,
  /** 曜日リスト */
  LISTDATA_PD_016: `${LISTDATA_COMMON_STORE_KEY}016`,
  /** 曜日リスト */
  LISTDATA_PD_016_WEEK_FORMAT: `${LISTDATA_COMMON_STORE_KEY}016_week_format`,
  /** 月リスト */
  LISTDATA_PD_017: `${LISTDATA_COMMON_STORE_KEY}017`,
  CURRENCY_FORMAT_ALL: 'Currency_Format_All',
  OFFICE_ALL: 'Office_All',
  HOLIDAY_NATIONALHOLIDAYLISTFROMTODAY: `Holiday_NationalHolidayListFromToday`,
  DEPARTUREAIRPORT_ALL: 'DepartureAirport_All',
  DESTINATIONAIRPORT_ALL: 'DestinationAirport_All',
  REGION_ALL: 'Region_All',
  LANGCODECONVERT_ALL: 'LangCodeConvert_All',
  /** 空港別時差_空港コード */
  AIRPORT_TIMEDIFF: 'AirportTimeDiff_ByAirportCode',

  Airport_All: 'Airport_All',
  M_FF_PRIORITY_CODE_I18N: 'm_ff_priority_code_i18n',
  AirportI18n_SearchForAirportCode: 'AirportI18n_SearchForAirportCode',
  AIRPORT_I18N_JOIN_BY_AIRPORT_CODE: 'Airport_I18nJoin_ByAirportCode',
  LISTDATA_ALL: 'ListData_All',
  M_LIST_DATA_930: 'm_list_data_930',
  M_LIST_DATA_931: 'm_list_data_931',
  M_LIST_DATA_940: 'm_list_data_940',
  M_AIRPORT_I18N: 'mAirportI18NList',
  LANGCODECONVERT: `langCodeConvert`,
  AIRLINE: 'mAirline',
  M_AIRLINE_I18N: 'm_airline_i18n/M_airline_i18n',
  AIRLINE_I18N_JOINALL: 'Airline_I18nJoinAll',
  BANK_LANG: 'Bank_Lang',
  BANK_ALL: 'Bank_all',
  AIRCRAFT_CABIN_I18N_JOIN_ACV_AND_CABIN: 'AirCraftCabin_I18nJoin_ACVandCabin',
  REGION_JAPAN: 'Region_Japan',
  DEPARTURE_AIRPORT_EXCEPT_CUBA: 'DepartureAirport_ExceptCuba',
  DEPARTURE_AIRPORT_JAPAN: 'DepartureAirport_Japan',
  DESTINATION_AIRPORT_JAPAN: 'DestinationAirport_Japan',
  DESTINATION_AIRPORT_EXCEPT_CUBA: 'DestinationAirport_ExceptCuba',
  REGION_ABROAD: 'Region_Abroad',
  DESTINATION_AIRPORT_ABROAD: 'DestinationAirport_Abroad',
  SERVICE_CONTENTS: 'ServiceContentsByItineraryType_Cabin',
  M_SERVICE_CONTENTS_I18N: 'm_service_contents_i18n',
  CFF_CFFCODE: 'CFF_CFFCode',

  /** 言語別有償表示対象CFFリスト */
  CFF_LISTEVERYLANG: 'CffListEveryLang',
  AIRLINE_I18NJOIN_BY_AIRLINE_CODE: 'airlineI18nJoinByAirlineCode',
  /** SMDI_提携BE_キャッシュ一覧_URLカラムの見直しのRES対応:
   * Equipment_Pk→　Equipment_I18nJoin_Pk,
   * AircraftCabin_ByPk→　AircraftCabin_I18nJoin_ByPk,
   * FfPriorityCode_ByFfPriorityCode→　FfPriorityCode_I18nJoin_ByFfPriorityCode,
   * Airline_AirlineCode→　Airline_I18nJoin_ByAirlineCode
   * AirCraftCabin_ACVandCabin→ AirCraftCabin_I18nJoin_ACVandCabin
   * equipmentByAcv→　Equipment_I18nJoin_ByAcv
   */
  EQUIPMENT_I18N_JOIN_BY_ACV: 'Equipment_I18nJoin_ByAcv',
  EQUIPMENT_I18NJOIN_PK: 'Equipment_I18nJoin_Pk',
  AIRCRAFTCABIN_I18NJOIN_BYPK: 'AircraftCabin_I18nJoin_ByPk',
  FFPRIORITYCODE_I18NJOIN_BYFFPRIORITYCODE: 'FfPriorityCode_I18nJoin_ByFfPriorityCode',
  AIRLINE_I18NJOIN_BYAIRLINECODE: 'Airline_I18nJoin_ByAirlineCode',

  /** 支払不可情報_オフィスコード */
  MUNAVAILABLEPAYMENT_BYOFFICECODE: 'MUnavailablePayment_ByOfficeCode',
} as const;

export const MASTER_TABLE = {
  M_FF_PRIORITY_CODE_I18N: {
    key: 'm_ff_priority_code_i18n',
    fileName: 'm_ff_priority_code_i18n/M_ff_priority_code_i18n',
    isCurrentLang: true,
  },
  AIRLINE_I18NJOINALL: {
    key: 'Airline_I18nJoinAll',
    fileName: 'Airline_I18nJoinAll',
    isCurrentLang: true,
  },
  BANK_ALL: {
    key: 'Bank_All',
    fileName: 'Bank_All',
  },
  // 照会用空港リスト(M_AIRPORT,M_AIRPORT_I18N全項目)
  AIRPORT_I18N_SEARCH_FOR_AIRPORT_CODE: {
    key: 'AirportI18n_SearchForAirportCode',
    fileName: 'AirportI18n_SearchForAirportCode',
    isCurrentLang: true,
  },
  // 多言語対応された空港名を取得するため
  AIRPORT_I18N_JOIN_BY_AIRPORT_CODE: {
    key: 'Airport_I18nJoin_ByAirportCode',
    fileName: 'Airport_I18nJoin_ByAirportCode',
    isCurrentLang: true,
  },
  LISTDATA_ALL: {
    key: 'ListData_All',
    fileName: 'ListData_All',
  },
  M_LIST_DATA_930: {
    key: 'm_list_data_930',
    fileName: 'm_list_data_930/M_list_data_930',
    isCurrentLang: true,
  },
  M_LIST_DATA_931: {
    key: 'm_list_data_931',
    fileName: 'm_list_data_930/M_list_data_931',
    isCurrentLang: true,
  },
  OFFICE_ALL: {
    key: 'Office_All',
    fileName: 'Office_All',
  },
  M_LIST_DATA_940: {
    key: 'm_list_data_940',
    fileName: 'm_list_data_940/M_list_data_940',
    isCurrentLang: true,
  },
  M_AIRPORT_I18N: {
    key: 'mAirportI18NList',
    fileName: 'm_airport_i18n/M_airport_i18n',
    isCurrentLang: true,
  },
  DESTINATION_AIRPORT_ABROAD: {
    key: 'DestinationAirport_Abroad',
    fileName: 'DestinationAirport_Abroad',
    isCurrentLang: true,
  },
  REGION_ABROAD: {
    key: 'Region_Abroad',
    fileName: 'Region_Abroad',
    isCurrentLang: true,
  },
  DESTINATION_AIRPORT_EXCEPT_CUBA: {
    key: 'DestinationAirport_ExceptCuba',
    fileName: 'DestinationAirport_ExceptCuba',
    isCurrentLang: true,
  },
  DEPARTURE_AIRPORT_JAPAN: {
    key: 'DepartureAirport_Japan',
    fileName: 'DepartureAirport_Japan',
    isCurrentLang: true,
  },
  DESTINATION_AIRPORT_JAPAN: {
    key: 'DestinationAirport_Japan',
    fileName: 'DestinationAirport_Japan',
    isCurrentLang: true,
  },
  DEPARTURE_AIRPORT_EXCEPT_CUBA: {
    key: 'DepartureAirport_ExceptCuba',
    fileName: 'DepartureAirport_ExceptCuba',
    isCurrentLang: true,
  },
  REGION_JAPAN: {
    key: 'Region_Japan',
    fileName: 'Region_Japan',
    isCurrentLang: true,
  },
  REGION_ALL: {
    key: 'Region_All',
    fileName: 'Region_All',
    isCurrentLang: true,
  },
  DESTINATION_AIRPORT_ALL: {
    key: 'DestinationAirport_All',
    fileName: 'DestinationAirport_All',
    isCurrentLang: true,
  },
  DEPARTURE_AIRPORT_ALL: {
    key: 'DepartureAirport_All',
    fileName: 'DepartureAirport_All',
    isCurrentLang: true,
  },
  AIRPORT_ALL: {
    key: 'Airport_All',
    fileName: 'Airport_All',
  },
  SERVICE_CONTENTS: {
    key: 'ServiceContentsByItineraryType_Cabin',
    fileName: 'ServiceContentsByItineraryType_Cabin',
    isCurrentLang: true,
  },
  FUNCTION_INELIGIBLE_REASON_PK: {
    key: 'FunctionIneligibleReason_ByPk',
    fileName: 'FunctionIneligibleReason_ByPk',
  },
  AIRCRAFT_CABIN_I18N_JOIN_ACV_AND_CABIN: {
    key: 'AirCraftCabin_I18nJoin_ACVandCabin',
    fileName: 'AirCraftCabin_I18nJoin_ACVandCabin',
    isCurrentLang: true,
  },
  AIRLINE_I18NJOIN_BY_AIRLINE_CODE: {
    key: 'airlineI18nJoinByAirlineCode',
    fileName: 'Airline_I18nJoin_ByAirlineCode',
    isCurrentLang: true,
  },
  /** SMDI_提携BE_キャッシュ一覧_URLカラムの見直しのRES対応:
   * Equipment_Pk→　Equipment_I18nJoin_Pk,
   * AircraftCabin_ByPk→　AircraftCabin_I18nJoin_ByPk,
   * FfPriorityCode_ByFfPriorityCode→　FfPriorityCode_I18nJoin_ByFfPriorityCode,
   * Airline_AirlineCode→　Airline_I18nJoin_ByAirlineCode
   * AirCraftCabin_ACVandCabin→ AirCraftCabin_I18nJoin_ACVandCabin
   */
  EQUIPMENT_I18NJOIN_PK: {
    key: 'Equipment_I18nJoin_Pk',
    fileName: 'Equipment_I18nJoin_Pk',
    isCurrentLang: true,
  },
  AIRCRAFTCABIN_I18NJOIN_BYPK: {
    key: 'AircraftCabin_I18nJoin_ByPk',
    fileName: 'AircraftCabin_I18nJoin_ByPk',
    isCurrentLang: true,
  },
  FFPRIORITYCODE_I18NJOIN_BYFFPRIORITYCODE: {
    key: 'FfPriorityCode_I18nJoin_ByFfPriorityCode',
    fileName: 'FfPriorityCode_I18nJoin_ByFfPriorityCode',
    isCurrentLang: true,
  },
};

/**
 * ロードするマスタキャッシュ一覧
 */
export const LOAD_MASTER_LIST: LoadAswMasterInfo[] = [
  {
    key: MasterStoreKey.AirportI18n_SearchForAirportCode,
    fileName: 'AirportI18n_SearchForAirportCode',
    isCurrentLang: true,
  },
  {
    key: MasterStoreKey.CFF_LISTEVERYLANG,
    fileName: `${MasterStoreKey.CFF_LISTEVERYLANG}/${MasterStoreKey.CFF_LISTEVERYLANG}`,
    isCurrentLang: true,
  },
  {
    key: MasterStoreKey.PROPERTY,
    fileName: 'Property_ForAkamaiCache',
  },
  {
    key: MasterStoreKey.DXAPI_ERROR_CODE,
    fileName: 'DxapiErrorCode_ForAkamaiCache',
  },
  {
    key: MasterStoreKey.OPERATION_CONFIRM_LOG,
    fileName: 'OperationConfirmLog',
  },
  {
    key: MasterStoreKey.LISTDATA_PD_016,
    fileName: 'ListLabelValue_pd_016',
  },
  {
    key: MasterStoreKey.LISTDATA_PD_016_WEEK_FORMAT,
    fileName: 'm_list_data_pd_016/M_list_data_pd_016',
    isCurrentLang: true,
  },
  {
    key: MasterStoreKey.LISTDATA_PD_017,
    fileName: 'ListLabelValue_pd_017',
  },
  {
    key: MasterStoreKey.CURRENCY_FORMAT_ALL,
    fileName: 'Currency_Format_All/Currency_Format',
    isCurrentLang: true,
  },
  {
    key: MasterStoreKey.OFFICE_ALL,
    fileName: 'Office_All',
  },
  {
    key: MasterStoreKey.HOLIDAY_NATIONALHOLIDAYLISTFROMTODAY,
    fileName: 'Holiday_NationalHolidayListFromToday',
  },
  {
    key: MasterStoreKey.DEPARTUREAIRPORT_ALL,
    fileName: 'DepartureAirport_All',
    isCurrentLang: true,
  },
  {
    key: MasterStoreKey.DESTINATIONAIRPORT_ALL,
    fileName: 'DestinationAirport_All',
    isCurrentLang: true,
  },
  {
    key: MasterStoreKey.REGION_ALL,
    fileName: 'Region_All',
    isCurrentLang: true,
  },
  {
    key: MasterStoreKey.LANGCODECONVERT_ALL,
    fileName: 'LangCodeConvert_All',
  },
  {
    key: MasterStoreKey.AIRPORT_TIMEDIFF,
    fileName: 'AirportTimeDiff_ByAirportCode',
    suffixKeys: ['_1', '_2'],
  },
  {
    key: MasterStoreKey.IFLY_ERROR_CODE_ERRORMESSAGE,
    fileName: 'IflyErrorCode_ErrorMessage',
  },
  /**
   * 画面側追加キャッシュ
   */
  {
    key: MasterStoreKey.BANK_LANG,
    fileName: 'Bank_Lang',
  },
  {
    key: MasterStoreKey.Airport_All,
    fileName: 'Airport_All',
  },
  {
    key: 'm_list_data_930',
    fileName: 'm_list_data_930/M_list_data_930',
    isCurrentLang: true,
  },

  //消す予定のキャッシュ
  {
    key: MasterStoreKey.M_AIRPORT_I18N,
    fileName: 'm_airport_i18n/M_airport_i18n',
    isCurrentLang: true,
  },
  {
    key: MasterStoreKey.SERVICE_CONTENTS,
    fileName: 'ServiceContentsByItineraryType_Cabin_ja',
  },
  //キャッシュを復活（Redmine #38185）
  {
    key: MasterStoreKey.M_AIRLINE_I18N,
    fileName: 'm_airline_i18n/M_airline_i18n',
    isCurrentLang: true,
  },
  {
    key: MasterStoreKey.AIRPORT_I18N_JOIN_BY_AIRPORT_CODE,
    fileName: 'Airport_I18nJoin_ByAirportCode',
    isCurrentLang: true,
  },
  /** SMDI_提携BE_キャッシュ一覧_URLカラムの見直しのRES対応:
   * Equipment_ByAcv→　Equipment_I18nJoin_ByAcv,
   * Equipment_Pk→　Equipment_I18nJoin_Pk,
   * AircraftCabin_ByPk→　AircraftCabin_I18nJoin_ByPk,
   * FfPriorityCode_ByFfPriorityCode→　FfPriorityCode_I18nJoin_ByFfPriorityCode,
   * Airline_AirlineCode→　Airline_I18nJoin_ByAirlineCode
   */
  {
    key: MasterStoreKey.EQUIPMENT_I18N_JOIN_BY_ACV,
    fileName: 'Equipment_I18nJoin_ByAcv',
    isCurrentLang: true,
  },
  {
    key: MasterStoreKey.EQUIPMENT_I18NJOIN_PK,
    fileName: 'Equipment_I18nJoin_Pk',
    isCurrentLang: true,
  },
  {
    key: MasterStoreKey.AIRCRAFTCABIN_I18NJOIN_BYPK,
    fileName: 'AircraftCabin_I18nJoin_ByPk',
    isCurrentLang: true,
  },
  {
    key: MasterStoreKey.FFPRIORITYCODE_I18NJOIN_BYFFPRIORITYCODE,
    fileName: 'FfPriorityCode_I18nJoin_ByFfPriorityCode',
    isCurrentLang: true,
  },
  {
    key: MasterStoreKey.AIRLINE_I18NJOIN_BYAIRLINECODE,
    fileName: 'Airline_I18nJoin_ByAirlineCode',
    isCurrentLang: true,
  },

  // 支払不可情報_オフィスコード
  {
    key: MasterStoreKey.MUNAVAILABLEPAYMENT_BYOFFICECODE,
    fileName: 'MUnavailablePayment_ByOfficeCode',
  },
];

/**
 * マスタキャッシュJSONデータの各JSONキーPrefix
 */
export const MasterJsonKeyPrefix = {
  /** 静的文言 */
  STATIC: 'm_static_message-',
  /** エラー文言 */
  ERROR: 'm_error_message-',
  /** 動的文言 */
  DYNAMIC: 'm_dynamic_message-',
} as const;

/** 文言キーprefix */
export const TranslatePrefix = {
  AIRPORT: 'm_airport_i18n_',
  AIRLINE: 'm_airline_i18n_',
  LIST_DATA: 'm_list_data_',
} as const;
