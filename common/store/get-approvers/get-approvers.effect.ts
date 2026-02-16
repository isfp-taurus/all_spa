import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { from, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { fromApiEffectSwitchMap } from '@lib/store';
import {
  cancelGetApproversRequest,
  failGetApprovers,
  setGetApprovers,
  setGetApproversFromApi,
  updateGetApprovers,
  updateGetApproversFromApi,
} from './get-approvers.actions';

/**
 * Service to handle async GetApprovers actions
 */
@Injectable()
export class GetApproversEffect {
  /**
   * Set the state with the reply content, dispatch failGetApprovers if it catches a failure
   */
  public setFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setGetApproversFromApi),
      fromApiEffectSwitchMap(
        (reply, action) => setGetApprovers({ ...reply, requestId: action.requestId }),
        (error, action) => of(failGetApprovers({ error, requestId: action.requestId })),
        cancelGetApproversRequest
      )
    )
  );

  /**
   * Update the state with the reply content, dispatch failGetApprovers if it catches a failure
   */
  public updateFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateGetApproversFromApi),
      mergeMap((payload) =>
        from(payload.call).pipe(
          map((reply) => updateGetApprovers({ ...reply, requestId: payload.requestId })),
          catchError((err) => of(failGetApprovers({ error: err, requestId: payload.requestId })))
        )
      )
    )
  );

  constructor(protected actions$: Actions) {}
}
