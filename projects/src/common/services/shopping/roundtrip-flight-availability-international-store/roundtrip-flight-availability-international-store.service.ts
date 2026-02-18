/**
 * 空席照会結果(OWD)API store サービス
 *
 */
import { Injectable } from '@angular/core';
import { SupportClass } from '@lib/components/support-class';
import { select, Store } from '@ngrx/store';
import { filter, Observable } from 'rxjs';
import { SearchApiService } from 'src/sdk-search';
import { RoundtripOwdRequest } from '@common/interfaces/shopping/roundtrip-owd';
import {
  RoundtripFlightAvailabilityInternationalModel,
  RoundtripFlightAvailabilityInternationalStore,
  resetRoundtripFlightAvailabilityInternational,
  selectRoundtripFlightAvailabilityInternationalState,
  setRoundtripFlightAvailabilityInternationalFromApi,
} from '@common/store/shopping/roundtrip-flight-availability-international';

/**
 * 往復指定日空席照会(OWD)API store サービス
 *
 * store情報
 * @param roundtripFlightAvailabilityInternationalData @see RoundtripFlightAvailabilityInternationalModel
 */
@Injectable()
export class RoundtripFlightAvailabilityInternationalStoreService extends SupportClass {
  private _roundtripFlightAvailabilityInternational$: Observable<RoundtripFlightAvailabilityInternationalModel>;
  private _roundtripFlightAvailabilityInternationalData!: RoundtripFlightAvailabilityInternationalModel;
  get roundtripFlightAvailabilityInternationalData() {
    return this._roundtripFlightAvailabilityInternationalData;
  }

  constructor(private _store: Store<RoundtripFlightAvailabilityInternationalStore>, private _api: SearchApiService) {
    super();
    this._roundtripFlightAvailabilityInternational$ = this._store.pipe(
      select(selectRoundtripFlightAvailabilityInternationalState),
      filter((data) => !!data)
    );
    this.subscribeService(
      'roundtripFlightAvailabilityInternational',
      this._roundtripFlightAvailabilityInternational$,
      (data) => {
        this._roundtripFlightAvailabilityInternationalData = data;
      }
    );
  }

  destroy() {}

  public getRoundtripFlightAvailabilityInternational$() {
    return this._roundtripFlightAvailabilityInternational$;
  }

  public resetRoundtripFlightAvailabilityInternational() {
    this._store.dispatch(resetRoundtripFlightAvailabilityInternational());
  }

  public setRoundtripFlightAvailabilityInternationalFromApi(request: RoundtripOwdRequest) {
    this._store.dispatch(
      setRoundtripFlightAvailabilityInternationalFromApi({ call: this._api.roundtripOwdPost(request) })
    );
  }
}
