import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { from, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { fromApiEffectSwitchMap } from '@lib/store';
import {
  cancelUpgradeWaitlistRequest,
  failUpgradeWaitlist,
  setUpgradeWaitlist,
  setUpgradeWaitlistFromApi,
  updateUpgradeWaitlist,
  updateUpgradeWaitlistFromApi,
} from './upgrade-waitlist.actions';

/**
 * Service to handle async UpgradeWaitlist actions
 */
@Injectable()
export class UpgradeWaitlistEffect {
  /**
   * Set the state with the reply content, dispatch failUpgradeWaitlist if it catches a failure
   */
  public setFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setUpgradeWaitlistFromApi),
      fromApiEffectSwitchMap(
        (reply, action) => setUpgradeWaitlist({ ...reply, requestId: action.requestId }),
        (error, action) => of(failUpgradeWaitlist({ error, requestId: action.requestId })),
        cancelUpgradeWaitlistRequest
      )
    )
  );

  /**
   * Update the state with the reply content, dispatch failUpgradeWaitlist if it catches a failure
   */
  public updateFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateUpgradeWaitlistFromApi),
      mergeMap((payload) =>
        from(payload.call).pipe(
          map((reply) => updateUpgradeWaitlist({ ...reply, requestId: payload.requestId })),
          catchError((err) => of(failUpgradeWaitlist({ error: err, requestId: payload.requestId })))
        )
      )
    )
  );

  constructor(protected actions$: Actions) {}
}
