import { FlightType, ShareholderCouponsType, TravelerType } from '@common/interfaces';
import { Bound, Traveler, Type1 } from 'src/sdk-servicing';

/**
 * 株主優待情報を作成する
 */
export function makeShareholderCoupons(bounds: Bound[] | undefined, travelers: Traveler[] | undefined, prefix: string) {
  const shareholderCoupons = [] as Array<ShareholderCouponsType>;
  // 株主優待番号プレフィックス

  bounds?.forEach((bound) => {
    // セグメント情報
    // PNR情報取得APIレスポンス.data.air.bounds.flightsの件数分、繰り返し
    // ※但し、当該セグメント情報.fareInfos.fareType≠shareholdersBenefitDiscount(株主優待割引)であるセグメントを除外する
    const flights = bound.flights ?? ([] as Type1[]);
    const _flights: FlightType[] = flights
      // ※但し、当該セグメント情報.fareInfos.fareType≠shareholdersBenefitDiscount(株主優待割引)であるセグメントを除外する
      .filter((flight) => flight?.fareInfos?.fareType === 'shareholdersBenefitDiscount')
      .map((flight) => ({
        flightId: flight.id ?? '',
        originFlight: flight,
        // PNR情報取得APIレスポンス.data.travelersの件数分、繰り返し※passengerTypeCode=”INF”を除く
        travelers: (travelers?.filter((item) => item.passengerTypeCode !== 'INF') ?? []).map((traveler) => ({
          travelerId: traveler.id ?? '',
          number: '', // “”(空欄)
          pin: '', // “”(空欄)
          originTraveler: traveler,
        })) as TravelerType[],
      }));
    shareholderCoupons.push({
      flights: _flights,
      prefix: prefix,
    });
  });

  return shareholderCoupons;
}
