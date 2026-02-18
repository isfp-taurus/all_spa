import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { from, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { fromApiEffectSwitchMap } from '@lib/store';
import {
  cancelRefreshAmcmemberBalanceRequest,
  failRefreshAmcmemberBalance,
  setRefreshAmcmemberBalance,
  setRefreshAmcmemberBalanceFromApi,
  updateRefreshAmcmemberBalance,
  updateRefreshAmcmemberBalanceFromApi,
} from './refresh-amcmember-balance.actions';

/**
 * Service to handle async RefreshAmcmemberBalance actions
 */
@Injectable()
export class RefreshAmcmemberBalanceEffect {
  /**
   * Set the state with the reply content, dispatch failRefreshAmcmemberBalance if it catches a failure
   */
  public setFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setRefreshAmcmemberBalanceFromApi),
      fromApiEffectSwitchMap(
        (reply, action) => setRefreshAmcmemberBalance({ ...reply, requestId: action.requestId }),
        (error, action) => of(failRefreshAmcmemberBalance({ error, requestId: action.requestId })),
        cancelRefreshAmcmemberBalanceRequest
      )
    )
  );

  /**
   * Update the state with the reply content, dispatch failRefreshAmcmemberBalance if it catches a failure
   */
  public updateFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateRefreshAmcmemberBalanceFromApi),
      mergeMap((payload) =>
        from(payload.call).pipe(
          map((reply) => updateRefreshAmcmemberBalance({ ...reply, requestId: payload.requestId })),
          catchError((err) => of(failRefreshAmcmemberBalance({ error: err, requestId: payload.requestId })))
        )
      )
    )
  );

  constructor(protected actions$: Actions) {}
}
