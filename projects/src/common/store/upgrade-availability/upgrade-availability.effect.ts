import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { from, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { fromApiEffectSwitchMap } from '@lib/store';
import {
  cancelUpgradeAvailabilityRequest,
  failUpgradeAvailability,
  setUpgradeAvailability,
  setUpgradeAvailabilityFromApi,
  updateUpgradeAvailability,
  updateUpgradeAvailabilityFromApi,
} from './upgrade-availability.actions';

/**
 * Service to handle async UpgradeAvailability actions
 */
@Injectable()
export class UpgradeAvailabilityEffect {
  /**
   * Set the state with the reply content, dispatch failUpgradeAvailability if it catches a failure
   */
  public setFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setUpgradeAvailabilityFromApi),
      fromApiEffectSwitchMap(
        (reply, action) => setUpgradeAvailability({ ...reply, requestId: action.requestId }),
        (error, action) => of(failUpgradeAvailability({ error, requestId: action.requestId })),
        cancelUpgradeAvailabilityRequest
      )
    )
  );

  /**
   * Update the state with the reply content, dispatch failUpgradeAvailability if it catches a failure
   */
  public updateFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateUpgradeAvailabilityFromApi),
      mergeMap((payload) =>
        from(payload.call).pipe(
          map((reply) => updateUpgradeAvailability({ ...reply, requestId: payload.requestId })),
          catchError((err) => of(failUpgradeAvailability({ error: err, requestId: payload.requestId })))
        )
      )
    )
  );

  constructor(protected actions$: Actions) {}
}
