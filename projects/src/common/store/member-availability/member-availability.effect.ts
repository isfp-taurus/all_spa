import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { from, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { fromApiEffectSwitchMap } from '@lib/store';
import {
  cancelMemberAvailabilityRequest,
  failMemberAvailability,
  setMemberAvailability,
  setMemberAvailabilityFromApi,
  updateMemberAvailability,
  updateMemberAvailabilityFromApi,
} from './member-availability.actions';

/**
 * Service to handle async MemberAvailability actions
 */
@Injectable()
export class MemberAvailabilityEffect {
  /**
   * Set the state with the reply content, dispatch failMemberAvailability if it catches a failure
   */
  public setFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setMemberAvailabilityFromApi),
      fromApiEffectSwitchMap(
        (reply, action) => setMemberAvailability({ model: reply, requestId: action.requestId }),
        (error, action) => of(failMemberAvailability({ error, requestId: action.requestId })),
        cancelMemberAvailabilityRequest
      )
    )
  );

  /**
   * Update the state with the reply content, dispatch failMemberAvailability if it catches a failure
   */
  public updateFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateMemberAvailabilityFromApi),
      mergeMap((payload) =>
        from(payload.call).pipe(
          map((reply) => updateMemberAvailability({ model: reply, requestId: payload.requestId })),
          catchError((err) => of(failMemberAvailability({ error: err, requestId: payload.requestId })))
        )
      )
    )
  );

  constructor(protected actions$: Actions) {}
}
