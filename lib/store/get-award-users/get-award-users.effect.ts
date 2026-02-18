import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { from, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { fromApiEffectSwitchMap } from '../common';
import {
  cancelGetAwardUsersRequest,
  failGetAwardUsers,
  setGetAwardUsers,
  setGetAwardUsersFromApi,
  updateGetAwardUsers,
  updateGetAwardUsersFromApi,
} from './get-award-users.actions';

/**
 * Service to handle async GetAwardUsers actions
 */
@Injectable()
export class GetAwardUsersEffect {
  /**
   * Set the state with the reply content, dispatch failGetAwardUsers if it catches a failure
   */
  public setFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setGetAwardUsersFromApi),
      fromApiEffectSwitchMap(
        (reply, action) => setGetAwardUsers({ ...reply, requestId: action.requestId }),
        (error, action) => of(failGetAwardUsers({ error, requestId: action.requestId })),
        cancelGetAwardUsersRequest
      )
    )
  );

  /**
   * Update the state with the reply content, dispatch failGetAwardUsers if it catches a failure
   */
  public updateFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateGetAwardUsersFromApi),
      mergeMap((payload) =>
        from(payload.call).pipe(
          map((reply) => updateGetAwardUsers({ ...reply, requestId: payload.requestId })),
          catchError((err) => of(failGetAwardUsers({ error: err, requestId: payload.requestId })))
        )
      )
    )
  );

  constructor(protected actions$: Actions) {}
}
