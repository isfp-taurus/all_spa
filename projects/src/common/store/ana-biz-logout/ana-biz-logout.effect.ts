import { Injectable } from '@angular/core';
import { fromApiEffectSwitchMap } from '@lib/store';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { from, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import {
  cancelAnaBizLogoutRequest,
  failAnaBizLogout,
  setAnaBizLogout,
  setAnaBizLogoutFromApi,
  updateAnaBizLogout,
  updateAnaBizLogoutFromApi,
} from './ana-biz-logout.actions';

/**
 * Service to handle async AnaBizLogout actions
 */
@Injectable()
export class AnaBizLogoutEffect {
  /**
   * Set the state with the reply content, dispatch failAnaBizLogout if it catches a failure
   */
  public setFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setAnaBizLogoutFromApi),
      fromApiEffectSwitchMap(
        (reply, action) => setAnaBizLogout({ ...reply, requestId: action.requestId }),
        (error, action) => of(failAnaBizLogout({ error, requestId: action.requestId })),
        cancelAnaBizLogoutRequest
      )
    )
  );

  /**
   * Update the state with the reply content, dispatch failAnaBizLogout if it catches a failure
   */
  public updateFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateAnaBizLogoutFromApi),
      mergeMap((payload) =>
        from(payload.call).pipe(
          map((reply) => updateAnaBizLogout({ ...reply, requestId: payload.requestId })),
          catchError((err) => of(failAnaBizLogout({ error: err, requestId: payload.requestId })))
        )
      )
    )
  );

  constructor(protected actions$: Actions) {}
}
