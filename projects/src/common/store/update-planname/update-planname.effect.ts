import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { from } from 'rxjs/internal/observable/from';
import { of } from 'rxjs/internal/observable/of';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { fromApiEffectSwitchMap } from '@lib/store';
import {
  cancelUpdatePlannameRequest,
  failUpdatePlanname,
  setUpdatePlanname,
  setUpdatePlannameFromApi,
  updateUpdatePlanname,
  updateUpdatePlannameFromApi,
} from './update-planname.actions';

/**
 * Service to handle async UpdatePlanname actions
 */
@Injectable()
export class UpdatePlannameEffect {
  /**
   * Set the state with the reply content, dispatch failUpdatePlanname if it catches a failure
   */
  public setFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setUpdatePlannameFromApi),
      fromApiEffectSwitchMap(
        (reply, action) => setUpdatePlanname({ ...reply, requestId: action.requestId }),
        (error, action) => of(failUpdatePlanname({ error, requestId: action.requestId })),
        cancelUpdatePlannameRequest
      )
    )
  );

  /**
   * Update the state with the reply content, dispatch failUpdatePlanname if it catches a failure
   */
  public updateFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateUpdatePlannameFromApi),
      mergeMap((payload) =>
        from(payload.call).pipe(
          map((reply) => updateUpdatePlanname({ ...reply, requestId: payload.requestId })),
          catchError((err) => of(failUpdatePlanname({ error: err, requestId: payload.requestId })))
        )
      )
    )
  );

  constructor(protected actions$: Actions) {}
}
