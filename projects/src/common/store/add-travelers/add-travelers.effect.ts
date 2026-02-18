import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { from } from 'rxjs/internal/observable/from';
import { of } from 'rxjs/internal/observable/of';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { fromApiEffectSwitchMap } from '@lib/store';
import {
  cancelAddTravelersRequest,
  failAddTravelers,
  setAddTravelers,
  setAddTravelersFromApi,
  updateAddTravelers,
  updateAddTravelersFromApi,
} from './add-travelers.actions';

/**
 * Service to handle async AddTravelers actions
 */
@Injectable()
export class AddTravelersEffect {
  /**
   * Set the state with the reply content, dispatch failAddTravelers if it catches a failure
   */
  public setFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setAddTravelersFromApi),
      fromApiEffectSwitchMap(
        (reply, action) => setAddTravelers({ ...reply, requestId: action.requestId }),
        (error, action) => of(failAddTravelers({ error, requestId: action.requestId })),
        cancelAddTravelersRequest
      )
    )
  );

  /**
   * Update the state with the reply content, dispatch failAddTravelers if it catches a failure
   */
  public updateFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateAddTravelersFromApi),
      mergeMap((payload) =>
        from(payload.call).pipe(
          map((reply) => updateAddTravelers({ ...reply, requestId: payload.requestId })),
          catchError((err) => of(failAddTravelers({ error: err, requestId: payload.requestId })))
        )
      )
    )
  );

  constructor(protected actions$: Actions) {}
}
