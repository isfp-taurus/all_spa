import { ComplexFmfFareFamilyAirOffersInner, ComplexResponse, FindMoreFlightsRequest } from 'src/sdk-search';

/**
 * FindMoreFlights model
 */
export interface FindMoreFlightsModel {
  /** APIを呼び出すためのリクエスト */
  searchCondition?: FindMoreFlightsRequest;
  /** 複雑空席照会画面渡す用AirOffer */
  selectedAirOffer?: ComplexFmfFareFamilyAirOffersInner;
  /** 複雑空席照会画面渡す用fareFamilyCode */
  selectedFareFamilyCode?: string;
  /** 遷移元画面ID */
  previousId?: string;
  /** 遷移前のリスポンスのデータ */
  complexResponseData?: ComplexResponse;
}

/**
 *  model details
 */
export interface FindMoreFlightsStateDetails extends FindMoreFlightsModel {}

/**
 * FindMoreFlights store state
 */
export interface FindMoreFlightsState extends FindMoreFlightsStateDetails {}

/**
 * Name of the FindMoreFlights Store
 */
export const FIND_MORE_FLIGHTS_STORE_NAME = 'FindMoreFlights';

/**
 * FindMoreFlights Store Interface
 */
export interface FindMoreFlightsStore {
  /** FindMoreFlights state */
  [FIND_MORE_FLIGHTS_STORE_NAME]: FindMoreFlightsState;
}
