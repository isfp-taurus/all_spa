import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { from, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { fromApiEffectSwitchMap } from '@lib/store';
import {
  cancelRoundtripFlightAvailabilityInternationalRequest,
  failRoundtripFlightAvailabilityInternational,
  setRoundtripFlightAvailabilityInternational,
  setRoundtripFlightAvailabilityInternationalFromApi,
  updateRoundtripFlightAvailabilityInternational,
  updateRoundtripFlightAvailabilityInternationalFromApi,
} from './roundtrip-flight-availability-international.actions';

/**
 * Service to handle async RoundtripFlightAvailabilityInternational actions
 */
@Injectable()
export class RoundtripFlightAvailabilityInternationalEffect {
  /**
   * Set the state with the reply content, dispatch failRoundtripFlightAvailabilityInternational if it catches a failure
   */
  public setFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setRoundtripFlightAvailabilityInternationalFromApi),
      fromApiEffectSwitchMap(
        (reply, action) => setRoundtripFlightAvailabilityInternational({ ...reply, requestId: action.requestId }),
        (error, action) => of(failRoundtripFlightAvailabilityInternational({ error, requestId: action.requestId })),
        cancelRoundtripFlightAvailabilityInternationalRequest
      )
    )
  );

  /**
   * Update the state with the reply content, dispatch failRoundtripFlightAvailabilityInternational if it catches a failure
   */
  public updateFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateRoundtripFlightAvailabilityInternationalFromApi),
      mergeMap((payload) =>
        from(payload.call).pipe(
          map((reply) => updateRoundtripFlightAvailabilityInternational({ ...reply, requestId: payload.requestId })),
          catchError((err) =>
            of(failRoundtripFlightAvailabilityInternational({ error: err, requestId: payload.requestId }))
          )
        )
      )
    )
  );

  constructor(protected actions$: Actions) {}
}
