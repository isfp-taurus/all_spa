/**
 * お気に入り登録API store サービス
 *
 */
import { Injectable } from '@angular/core';
import { SupportClass } from '@lib/components/support-class';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs/internal/Observable';
import { filter } from 'rxjs/operators';
import {} from '@lib/store';
import { FavoritePostRequest } from 'src/sdk-search';
import {
  FavoritePostState,
  FavoritePostStore,
  resetFavoritePost,
  selectFavoritePostState,
  setFavoritePostFromApi,
} from '@common/store/favorite-post';
import { SearchApiService } from 'src/sdk-search/api/search-api.service';
import { HistoryPostRequestHistoryBoundsInner } from 'src/sdk-search/model/historyPostRequestHistoryBoundsInner';
import { HistoryPostRequestHistoryRoundtrip } from 'src/sdk-search/model/historyPostRequestHistoryRoundtrip';

/**
 * お気に入り登録API store サービス
 *
 * store情報
 * @param FavoriteData @see FavoriteStatusGetState
 */
@Injectable()
export class FavoritePostService extends SupportClass {
  private _Favorite$: Observable<FavoritePostState>;
  private _FavoriteData!: FavoritePostState;
  get FavoriteData() {
    return this._FavoriteData;
  }

  constructor(private _store: Store<FavoritePostStore>, private api: SearchApiService) {
    super();
    this._Favorite$ = this._store.pipe(
      select(selectFavoritePostState),
      filter((data) => !!data)
    );
    this.subscribeService('favorite-post-store.service', this._Favorite$, (data) => {
      this._FavoriteData = data;
    });
  }

  destroy() {}

  public getFavoritePost() {
    return this._Favorite$;
  }

  public resetFavoritePost() {
    this._store.dispatch(resetFavoritePost());
  }

  public setFavoritePostFromApi(request: FavoritePostRequest) {
    this._store.dispatch(setFavoritePostFromApi({ call: this.api.favoritePost(this.resetRequest(request)) }));
  }
  public resetRequest(request: FavoritePostRequest) {
    let round: HistoryPostRequestHistoryRoundtrip | undefined = undefined;
    let bounds: Array<HistoryPostRequestHistoryBoundsInner> | undefined = undefined;
    // 往復旅程
    if (request.favorite?.tripType === 'roundtrip' && request.favorite?.roundtrip) {
      round = {
        originLocationCode: request.favorite.roundtrip.originLocationCode,
        destinationLocationCode: request.favorite.roundtrip.destinationLocationCode,
        departureTimeWindowFrom: this.isNotEmpty(request.favorite.roundtrip.departureTimeWindowFrom)
          ? request.favorite.roundtrip.departureTimeWindowFrom
          : undefined,
        departureTimeWindowTo: this.isNotEmpty(request.favorite.roundtrip.departureTimeWindowTo)
          ? request.favorite.roundtrip.departureTimeWindowTo
          : undefined,
        returnTimeWindowFrom: this.isNotEmpty(request.favorite.roundtrip.returnTimeWindowFrom)
          ? request.favorite.roundtrip.returnTimeWindowFrom
          : undefined,
        returnTimeWindowTo: this.isNotEmpty(request.favorite.roundtrip.returnTimeWindowTo)
          ? request.favorite.roundtrip.returnTimeWindowTo
          : undefined,
        departureConnectionLocationCode: this.isNotEmpty(request.favorite.roundtrip.departureConnectionLocationCode)
          ? request.favorite.roundtrip.departureConnectionLocationCode
          : undefined,
        departureConnectionTime: this.isNotEmpty(request.favorite.roundtrip.departureConnectionTime)
          ? request.favorite.roundtrip.departureConnectionTime
          : undefined,
        returnConnectionLocationCode: this.isNotEmpty(request.favorite.roundtrip.returnConnectionLocationCode)
          ? request.favorite.roundtrip.returnConnectionLocationCode
          : undefined,
        returnConnectionTime: this.isNotEmpty(request.favorite.roundtrip.returnConnectionTime)
          ? request.favorite.roundtrip.returnConnectionTime
          : undefined,
        departureDate: request.favorite.roundtrip.departureDate,
        returnDate: request.favorite.roundtrip.returnDate,
      };
    } else {
      // 複雑旅程
      bounds = request.favorite?.bounds?.map((data) => {
        return {
          originLocationCode: data.originLocationCode,
          destinationLocationCode: data.destinationLocationCode,
          departureTimeWindowFrom: this.isNotEmpty(data.departureTimeWindowFrom)
            ? data.departureTimeWindowFrom
            : undefined,
          departureTimeWindowTo: this.isNotEmpty(data.departureTimeWindowTo) ? data.departureTimeWindowTo : undefined,
          departureDate: data.departureDate,
        };
      });
    }
    // API呼び出しパラメータを用意
    const favoritePostRequest: FavoritePostRequest = {
      favorite: {
        tripType: request.favorite?.tripType!,
        roundtrip: round,
        bounds: bounds,
        fare: {
          isMixedCabin: request.favorite?.fare?.isMixedCabin,
          cabinClass: request.favorite?.fare?.cabinClass,
          fareOptionType: request.favorite?.fare?.fareOptionType,
          mixedCabinClasses: request.favorite?.fare?.isMixedCabin
            ? {
                departureCabinClass: request.favorite.fare.mixedCabinClasses?.departureCabinClass,
                returnCabinClass: request.favorite.fare.mixedCabinClasses?.returnCabinClass,
              }
            : undefined,
        },
        travelers: {
          ADT: request.favorite!.travelers!.ADT,
          B15: request.favorite!.travelers!.B15,
          CHD: request.favorite!.travelers!.CHD,
          INF: request.favorite!.travelers!.INF,
        },
        hasAccompaniedInAnotherReservation: this.isNotEmpty(request.favorite?.hasAccompaniedInAnotherReservation)
          ? request.favorite?.hasAccompaniedInAnotherReservation
          : undefined,
        promotionCode: request.favorite?.promotionCode,
      },
    };
    return favoritePostRequest;
  }
  /** 空判定 */
  private isNotEmpty(value: any): boolean {
    return value !== '' && value !== null && value !== undefined;
  }
}
