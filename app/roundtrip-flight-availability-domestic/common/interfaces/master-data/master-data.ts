/** 国_統合オフィス指定と国_統合オフィス管轄外の電話番号居住国リストで取得された国コードと国名前 */
export interface CountryCodeNameType {
  countryCode: string;
  countryName: string;
}

/** 旅程区分とCabin Class(ServiceContentsByItineraryType_Cabinから検索用の条件) */
export interface ServiceConditionType {
  itineraryDivision?: ITINERARY_DIVISION;
  cabin?: string;
}

/** 旅程サービス情報タイプ */
export interface ServiceInfoType {
  itineraryDivision?: ITINERARY_DIVISION;
  serviceTypeList?: Array<ServiceType>;
}

/** 旅程区分 INT(国際線:'1'), JP(日本国内線:'0') */
export type ITINERARY_DIVISION = '0' | '1';
export const ITINERARY_DIVISION = {
  JP: '0' as ITINERARY_DIVISION,
  INT: '1' as ITINERARY_DIVISION,
};

/** 旅程サービスタイプ */
export interface ServiceType {
  serviceType: string;
  serviceMessage: string;
}
