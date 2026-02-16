import {
  Bound,
  BoundFlightsInner,
  CreateCartResponseDataSearchCriteriaSearchAirOfferItineraries,
  PostGetCartResponseData,
  PostGetCartResponseDataPlan,
  PostGetCartResponseDataPreviousPlan,
  Traveler,
} from 'src/sdk-reservation';
import { RoundtripOwdRequestItinerariesInner } from 'src/sdk-search';
import { deepCopyArray } from './deep-copy';
import { isEmptyObject } from './format';

/**
 * カート内のデータの操作をする
 */

/**
 * プランの有効状態に応じplanまたはpreviousPlanを取得する
 * @param cartData カート取得レスポンス.data
 * @returns プラン有効の場合plan、無効の場合previousPlan
 */
export function getDisplayCart(
  cartData: PostGetCartResponseData
): PostGetCartResponseDataPlan | PostGetCartResponseDataPreviousPlan | undefined {
  const isPlanValid = !isEmptyObject(cartData?.plan ?? {});
  return isPlanValid ? cartData.plan : cartData.previousPlan;
}

/**
 * バウンドデータからバウンド取得する
 * @param bounds バウンドデータ
 * @param boundId バウンドID
 * @returns 対象バウンド
 */
export function getBoundFromBoundId(bounds: Array<Bound>, boundId: string): Bound | undefined {
  return bounds.find((bound) => bound.airBoundId === boundId);
}

/**
 * バウンドデータから対象セグメントデータを含むバウンド取得する
 * @param bounds バウンドデータ
 * @param segmentId セグメントID
 * @returns 対象バウンド
 */
export function getBoundFromSegmentId(bounds: Array<Bound>, segmentId: string): Bound | undefined {
  return bounds.find((bound) => bound.flights?.some((flight) => flight.id === segmentId));
}
/**
 * バウンドデータから対象セグメントデータを取得する
 * @param bounds バウンドデータ
 * @param segmentId セグメントID
 * @returns 対象セグメント
 */
export function getBoundFlightFromSegmentId(bounds: Array<Bound>, segmentId: string): BoundFlightsInner | undefined {
  return bounds
    .find((bound) => bound.flights?.some((flight) => flight.id === segmentId))
    ?.flights?.find((flight) => flight.id === segmentId);
}

/**
 * フライトデータから対象セグメントデータを取得する
 * @param flights バウンドデータ
 * @param segmentId セグメントID
 * @returns 対象セグメント
 */
export function getFlightFromSegmentId(
  flights: Array<BoundFlightsInner>,
  segmentId: string
): BoundFlightsInner | undefined {
  return flights.find((flight) => flight.id === segmentId);
}

/**
 * 搭乗者リストから対象搭乗者を取得する
 * @param travelers 搭乗者リスト
 * @param travelerId 搭乗者ID
 * @returns 対象搭乗者
 */
export function getTravelerFromTravelerId(travelers: Array<Traveler>, travelerId: string): Traveler | undefined {
  return travelers.find((trav) => trav.id === travelerId);
}

/**
 * マスターデータをもとに空港名を取得する
 * @param code  空港コード
 * @param master  言語別空港名称マスタ
 */
export function getAirportNameFromCache(code: string, master: { [key: string]: string }) {
  const airPrefix = 'm_airport_i18n_';
  return master[airPrefix + code];
}

/**
 * マスターデータをもとにcareer空港名を取得する
 * @param code  キャリアコード
 * @param master  キャリア名称マスタ
 */
export function getAirLineNameFromCache(code: string, master: { [key: string]: string }) {
  const airPrefix = 'm_airline_i18n_';
  return master[airPrefix + code];
}

/**
 * キャビンクラス名称引き当て用のM_LIST_DATA valueを取得する
 * @param cabin  eco/ecoPremium/business/first
 * @param isDomestic  国内単独旅程の場合true
 * @param isAward  特典の場合true
 */
export function getCabinClassNameKey(cabin: string, isDomestic?: boolean, isAward?: boolean): string {
  return `${isAward ? 'A' : 'R'}-${isDomestic ? 'domestic' : 'international'}-${cabin}`;
}

/**
 * カートのsearchAirOffer.itinerariesを往復指定日空席照会(OWD)用APIリクエスト用に変換
 * @param cartItineraries searchAirOffer.itineraries
 * @returns 往復指定日空席照会(OWD)用APIリクエスト.itineraries
 */
export function getOwdRequestItinerariesFromCart(
  cartItineraries: Array<CreateCartResponseDataSearchCriteriaSearchAirOfferItineraries>
): Array<RoundtripOwdRequestItinerariesInner> {
  return deepCopyArray(cartItineraries).map((itinerary) => {
    if (isEmptyObject(itinerary.connection)) {
      // connectionが存在しないまたは空の場合、connectionなしのitineraryを返す
      const { connection: undefined, ...itineraryWithoutConnection } = itinerary;
      return itineraryWithoutConnection;
    }
    // connection.locationCodeをlocationCodesに変換
    const locationCode = itinerary.connection?.locationCode;
    const connection = {
      ...itinerary.connection,
      locationCodes: locationCode ? [locationCode] : [],
    };
    return { ...itinerary, connection };
  });
}
