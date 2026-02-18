import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { from } from 'rxjs/internal/observable/from';
import { of } from 'rxjs/internal/observable/of';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { fromApiEffectSwitchMap } from '@lib/store';
import {
  cancelDeletePlansRequest,
  failDeletePlans,
  setDeletePlans,
  setDeletePlansFromApi,
  updateDeletePlans,
  updateDeletePlansFromApi,
} from './delete-plans.actions';

/**
 * Service to handle async DeletePlans actions
 */
@Injectable()
export class DeletePlansEffect {
  /**
   * Set the state with the reply content, dispatch failDeletePlans if it catches a failure
   */
  public setFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setDeletePlansFromApi),
      fromApiEffectSwitchMap(
        (reply, action) => setDeletePlans({ ...reply, requestId: action.requestId }),
        (error, action) => of(failDeletePlans({ error, requestId: action.requestId })),
        cancelDeletePlansRequest
      )
    )
  );

  /**
   * Update the state with the reply content, dispatch failDeletePlans if it catches a failure
   */
  public updateFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateDeletePlansFromApi),
      mergeMap((payload) =>
        from(payload.call).pipe(
          map((reply) => updateDeletePlans({ ...reply, requestId: payload.requestId })),
          catchError((err) => of(failDeletePlans({ error: err, requestId: payload.requestId })))
        )
      )
    )
  );

  constructor(protected actions$: Actions) {}
}
