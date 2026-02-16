import { Injectable } from '@angular/core';
import { SearchFlightState, TripType } from '@common/store';
import { SupportClass } from '@lib/components/support-class/support-class';
import { ParmRoundTripType, RarmOnewayOrMulticity } from './interface.state';
import { SearchFlightHistoryStoreService, ShoppingLibService } from '@common/services';
import { UtilInterface } from './utils.state';
import { RoundtripFlightAvailabilityInternationalService } from '@common/services/roundtripFlightAvailabilityInternational/roundtripFlightAvailabilityInternational.service';
import { RoundtripFlightAvailabilityInternationalContService } from '@app/roundtrip-flight-availability-international/container/roundtrip-flight-availability-international-cont.service';
import { ComplexFlightAvailabilityStoreService } from './store.service';

@Injectable()
export class ComplexFlightAvailabilityUntilService extends SupportClass implements UtilInterface {
  constructor(
    private _shoppingLibService: ShoppingLibService,
    private _searchFlightHistoryStoreService: SearchFlightHistoryStoreService,
    private _roundtripFlightAvailabilityInternationalService: RoundtripFlightAvailabilityInternationalService,
    private _roundtripFlightAvailabilityService: RoundtripFlightAvailabilityInternationalContService,
    private _storeService: ComplexFlightAvailabilityStoreService
  ) {
    super();
  }

  destroy(): void {}

  /**
   * 日本国内単独旅程判定処理
   * @param {SearchFlightState} searchFlightData this._searchFlightStoreService?.getData();
   * @returns {boolean}
   */
  public checkJapanOnlyTrip(searchFlightData?: SearchFlightState): boolean {
    if (!searchFlightData) return false;
    const pRoundTrip: Partial<ParmRoundTripType> = {};
    const ponewayOrMulticity: RarmOnewayOrMulticity[] = [];
    if (searchFlightData?.tripType === TripType.ROUND_TRIP) {
      Object.assign(pRoundTrip, {
        departureOriginLocationCode: searchFlightData.roundTrip.departureOriginLocationCode,
        departureConnectionLocationCode: searchFlightData.roundTrip.departureConnection.connectionLocationCode,
        departureDestinationLocationCode: searchFlightData.roundTrip.departureDestinationLocationCode,
        returnConnectionLocationCode: searchFlightData.roundTrip.departureConnection.connectionLocationCode,
      });
    }

    if (searchFlightData?.tripType === TripType.ONEWAY_OR_MULTI_CITY) {
      searchFlightData?.onewayOrMultiCity.forEach((data) => {
        ponewayOrMulticity.push({
          originLocationCode: data.originLocationCode,
          destinationLocationCode: data.destinationLocationCode,
        });
      });
    }
    return (
      this._shoppingLibService?.checkJapanOnlyTrip(
        searchFlightData?.tripType === TripType.ROUND_TRIP ? (pRoundTrip as ParmRoundTripType) : undefined,
        searchFlightData?.tripType === TripType.ONEWAY_OR_MULTI_CITY ? ponewayOrMulticity : undefined
      ) ?? false
    );
  }

  public async isCheckFavorite() {
    const searchFlightObj = await this._storeService?.fetchSearchFlightData();
    let isRegisteredFavorite = false;
    let isNotFavoriteAnimation = false;
    const roundtripFlightAvailabilityInternationalData =
      this._roundtripFlightAvailabilityInternationalService.roundtripFlightAvailabilityInternationalData;
    this.subscribeService(
      'historyFavoriteGet',
      this._searchFlightHistoryStoreService.getRoundtripFlightAvailabilityInternationalObservable(),
      (response) => {
        if (response) {
          const historyFavoriteResponse = this._searchFlightHistoryStoreService.getData();
          // 動的文言判定用情報 履歴・お気に入り情報取得レスポンス
          this.deleteSubscription('historyFavoriteGet');
          const favoriteList = historyFavoriteResponse && historyFavoriteResponse.favorite;
          if (favoriteList) {
            if (this._roundtripFlightAvailabilityService.checkIsRegisteredFavorite(favoriteList, searchFlightObj)) {
              isRegisteredFavorite = true;
              isNotFavoriteAnimation = true;
            }
          }
        }
        this._roundtripFlightAvailabilityInternationalService.updateRoundtripFlightAvailabilityInternational({
          ...roundtripFlightAvailabilityInternationalData,
          isRegisteredFavorite,
          isNotFavoriteAnimation,
        });
      }
    );
  }
}
