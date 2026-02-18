import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { from, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import {
  cancelWaitlistRequest,
  failWaitlist,
  setWaitlist,
  setWaitlistFromApi,
  updateWaitlist,
  updateWaitlistFromApi,
} from './waitlist.actions';
import { fromApiEffectSwitchMap } from '@lib/store';

/**
 * Service to handle async Waitlist actions
 */
@Injectable()
export class WaitlistEffect {
  /**
   * Set the state with the reply content, dispatch failWaitlist if it catches a failure
   */
  public setFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setWaitlistFromApi),
      fromApiEffectSwitchMap(
        (reply, action) => setWaitlist({ model: reply, requestId: action.requestId }),
        (error, action) => of(failWaitlist({ error, requestId: action.requestId })),
        cancelWaitlistRequest
      )
    )
  );

  /**
   * Update the state with the reply content, dispatch failWaitlist if it catches a failure
   */
  public updateFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateWaitlistFromApi),
      mergeMap((payload) =>
        from(payload.call).pipe(
          map((reply) => updateWaitlist({ model: reply, requestId: payload.requestId })),
          catchError((err) => of(failWaitlist({ error: err, requestId: payload.requestId })))
        )
      )
    )
  );

  constructor(protected actions$: Actions) {}
}
