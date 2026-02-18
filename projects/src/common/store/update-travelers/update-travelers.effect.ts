import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { from, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { fromApiEffectSwitchMap } from '@lib/store';
import {
  cancelUpdateTravelersRequest,
  failUpdateTravelers,
  setUpdateTravelers,
  setUpdateTravelersFromApi,
  updateUpdateTravelers,
  updateUpdateTravelersFromApi,
} from './update-travelers.actions';

/**
 * Service to handle async UpdateTravelers actions
 */
@Injectable()
export class UpdateTravelersEffect {
  /**
   * Set the state with the reply content, dispatch failUpdateTravelers if it catches a failure
   */
  public setFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setUpdateTravelersFromApi),
      fromApiEffectSwitchMap(
        (reply, action) => setUpdateTravelers({ ...reply, requestId: action.requestId }),
        (error, action) => of(failUpdateTravelers({ error, requestId: action.requestId })),
        cancelUpdateTravelersRequest
      )
    )
  );

  /**
   * Update the state with the reply content, dispatch failUpdateTravelers if it catches a failure
   */
  public updateFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateUpdateTravelersFromApi),
      mergeMap((payload) =>
        from(payload.call).pipe(
          map((reply) => updateUpdateTravelers({ ...reply, requestId: payload.requestId })),
          catchError((err) => of(failUpdateTravelers({ error: err, requestId: payload.requestId })))
        )
      )
    )
  );

  constructor(protected actions$: Actions) {}
}
