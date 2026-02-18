import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { from, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { fromApiEffectSwitchMap } from '@lib/store';
import {
  cancelUpdateAirOffersRequest,
  failUpdateAirOffers,
  setUpdateAirOffers,
  setUpdateAirOffersFromApi,
  updateUpdateAirOffers,
  updateUpdateAirOffersFromApi,
} from './update-air-offers.actions';

/**
 * Service to handle async UpdateAirOffers actions
 */
@Injectable()
export class UpdateAirOffersEffect {
  /**
   * Set the state with the reply content, dispatch failUpdateAirOffers if it catches a failure
   */
  public setFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setUpdateAirOffersFromApi),
      fromApiEffectSwitchMap(
        (reply, action) => setUpdateAirOffers({ ...reply, requestId: action.requestId }),
        (error, action) => of(failUpdateAirOffers({ error, requestId: action.requestId })),
        cancelUpdateAirOffersRequest
      )
    )
  );

  /**
   * Update the state with the reply content, dispatch failUpdateAirOffers if it catches a failure
   */
  public updateFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateUpdateAirOffersFromApi),
      mergeMap((payload) =>
        from(payload.call).pipe(
          map((reply) => updateUpdateAirOffers({ ...reply, requestId: payload.requestId })),
          catchError((err) => of(failUpdateAirOffers({ error: err, requestId: payload.requestId })))
        )
      )
    )
  );

  constructor(protected actions$: Actions) {}
}
