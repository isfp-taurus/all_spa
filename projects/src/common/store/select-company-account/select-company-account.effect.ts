import { Injectable } from '@angular/core';
import { fromApiEffectSwitchMap } from '@lib/store';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { from, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import {
  cancelSelectCompanyAccountRequest,
  failSelectCompanyAccount,
  setSelectCompanyAccount,
  setSelectCompanyAccountFromApi,
  updateSelectCompanyAccount,
  updateSelectCompanyAccountFromApi,
} from './select-company-account.actions';

/**
 * Service to handle async SelectCompanyAccount actions
 */
@Injectable()
export class SelectCompanyAccountEffect {
  /**
   * Set the state with the reply content, dispatch failSelectCompanyAccount if it catches a failure
   */
  public setFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setSelectCompanyAccountFromApi),
      fromApiEffectSwitchMap(
        (reply, action) => setSelectCompanyAccount({ ...reply, requestId: action.requestId }),
        (error, action) => of(failSelectCompanyAccount({ error, requestId: action.requestId })),
        cancelSelectCompanyAccountRequest
      )
    )
  );

  /**
   * Update the state with the reply content, dispatch failSelectCompanyAccount if it catches a failure
   */
  public updateFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateSelectCompanyAccountFromApi),
      mergeMap((payload) =>
        from(payload.call).pipe(
          map((reply) => updateSelectCompanyAccount({ ...reply, requestId: payload.requestId })),
          catchError((err) => of(failSelectCompanyAccount({ error: err, requestId: payload.requestId })))
        )
      )
    )
  );

  constructor(protected actions$: Actions) {}
}
