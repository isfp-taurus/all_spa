import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { from, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { fromApiEffectSwitchMap } from '../common';
import {
  cancelAnaBizContextRequest,
  failAnaBizContext,
  setAnaBizContext,
  setAnaBizContextFromApi,
  updateAnaBizContext,
  updateAnaBizContextFromApi,
} from './ana-biz-context.actions';

/**
 * Service to handle async AnaBizContext actions
 */
@Injectable()
export class AnaBizContextEffect {
  /**
   * Set the state with the reply content, dispatch failAnaBizContext if it catches a failure
   */
  public setFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setAnaBizContextFromApi),
      fromApiEffectSwitchMap(
        (reply, action) => setAnaBizContext({ ...reply, requestId: action.requestId }),
        (error, action) => of(failAnaBizContext({ error, requestId: action.requestId })),
        cancelAnaBizContextRequest
      )
    )
  );

  /**
   * Update the state with the reply content, dispatch failAnaBizContext if it catches a failure
   */
  public updateFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateAnaBizContextFromApi),
      mergeMap((payload) =>
        from(payload.call).pipe(
          map((reply) => updateAnaBizContext({ ...reply, requestId: payload.requestId })),
          catchError((err) => of(failAnaBizContext({ error: err, requestId: payload.requestId })))
        )
      )
    )
  );

  constructor(protected actions$: Actions) {}
}
