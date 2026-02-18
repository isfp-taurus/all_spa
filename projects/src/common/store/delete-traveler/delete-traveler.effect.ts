import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { from, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { fromApiEffectSwitchMap } from '@lib/store';
import {
  cancelDeleteTravelerRequest,
  failDeleteTraveler,
  setDeleteTraveler,
  setDeleteTravelerFromApi,
  updateDeleteTraveler,
  updateDeleteTravelerFromApi,
} from './delete-traveler.actions';

/**
 * Service to handle async DeleteTraveler actions
 */
@Injectable()
export class DeleteTravelerEffect {
  /**
   * Set the state with the reply content, dispatch failDeleteTraveler if it catches a failure
   */
  public setFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setDeleteTravelerFromApi),
      fromApiEffectSwitchMap(
        (reply, action) => setDeleteTraveler({ ...reply, requestId: action.requestId }),
        (error, action) => of(failDeleteTraveler({ error, requestId: action.requestId })),
        cancelDeleteTravelerRequest
      )
    )
  );

  /**
   * Update the state with the reply content, dispatch failDeleteTraveler if it catches a failure
   */
  public updateFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateDeleteTravelerFromApi),
      mergeMap((payload) =>
        from(payload.call).pipe(
          map((reply) => updateDeleteTraveler({ ...reply, requestId: payload.requestId })),
          catchError((err) => of(failDeleteTraveler({ error: err, requestId: payload.requestId })))
        )
      )
    )
  );

  constructor(protected actions$: Actions) {}
}
