import { Injectable } from '@angular/core';
import { SupportClass } from '@lib/components/support-class';
import { select, Store } from '@ngrx/store';
import { filter, Observable } from 'rxjs';
import {
  RoundtripFlightAvailabilityInternationalState,
  RoundtripFlightAvailabilityInternationalStore,
  resetRoundtripFlightAvailabilityInternational,
  selectRoundtripFlightAvailabilityInternationalState,
  setRoundtripFlightAvailabilityInternational,
  updateRoundtripFlightAvailabilityInternational,
} from '@common/store/roundtripFlightAvailabilityInternational';

/**
 * 予約情報取得 store サービス
 *
 * store情報
 * @param roundtripFlightAvailabilityInternationalData @see RoundtripFlightAvailabilityInternationalState
 */
@Injectable()
export class RoundtripFlightAvailabilityInternationalService extends SupportClass {
  private _roundtripFlightAvailabilityInternational$: Observable<RoundtripFlightAvailabilityInternationalState>;
  private _roundtripFlightAvailabilityInternationalData!: RoundtripFlightAvailabilityInternationalState;
  get roundtripFlightAvailabilityInternationalData() {
    return this._roundtripFlightAvailabilityInternationalData;
  }

  constructor(private store: Store<RoundtripFlightAvailabilityInternationalStore>) {
    super();
    this._roundtripFlightAvailabilityInternational$ = this.store.pipe(
      select(selectRoundtripFlightAvailabilityInternationalState),
      filter((data) => !!data)
    );
    this.subscribeService(
      'roundtripFlightAvailabilityInternational.service',
      this._roundtripFlightAvailabilityInternational$,
      (data) => {
        this._roundtripFlightAvailabilityInternationalData = data;
      }
    );
  }

  destroy() {}

  public getRoundtripFlightAvailabilityInternationalObservable() {
    return this._roundtripFlightAvailabilityInternational$;
  }

  public updateRoundtripFlightAvailabilityInternational(value: Partial<RoundtripFlightAvailabilityInternationalState>) {
    this.store.dispatch(updateRoundtripFlightAvailabilityInternational(value));
  }

  public setRoundtripFlightAvailabilityInternational(value: RoundtripFlightAvailabilityInternationalState) {
    this.store.dispatch(setRoundtripFlightAvailabilityInternational(value));
  }

  public resetRoundtripFlightAvailabilityInternational() {
    this.store.dispatch(resetRoundtripFlightAvailabilityInternational());
  }
}
