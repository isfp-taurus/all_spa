import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { from, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { fromApiEffectSwitchMap } from '@lib/store';
import {
  cancelPlanListRequest,
  failPlanList,
  setPlanList,
  setPlanListFromApi,
  updatePlanList,
  updatePlanListFromApi,
} from './plan-list.actions';

/**
 * Service to handle async PlanList actions
 */
@Injectable()
export class PlanListEffect {
  /**
   * Set the state with the reply content, dispatch failPlanList if it catches a failure
   */
  public setFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setPlanListFromApi),
      fromApiEffectSwitchMap(
        (reply, action) => setPlanList({ ...reply, requestId: action.requestId }),
        (error, action) => of(failPlanList({ error, requestId: action.requestId })),
        cancelPlanListRequest
      )
    )
  );

  /**
   * Update the state with the reply content, dispatch failPlanList if it catches a failure
   */
  public updateFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updatePlanListFromApi),
      mergeMap((payload) =>
        from(payload.call).pipe(
          map((reply) => updatePlanList({ ...reply, requestId: payload.requestId })),
          catchError((err) => of(failPlanList({ error: err, requestId: payload.requestId })))
        )
      )
    )
  );

  constructor(protected actions$: Actions) {}
}
