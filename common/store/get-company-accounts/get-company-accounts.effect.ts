import { Injectable } from '@angular/core';
import { fromApiEffectSwitchMap } from '@lib/store';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { from, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import {
  cancelGetCompanyAccountsRequest,
  failGetCompanyAccounts,
  setGetCompanyAccounts,
  setGetCompanyAccountsFromApi,
  updateGetCompanyAccounts,
  updateGetCompanyAccountsFromApi,
} from './get-company-accounts.actions';

/**
 * Service to handle async GetCompanyAccounts actions
 */
@Injectable()
export class GetCompanyAccountsEffect {
  /**
   * Set the state with the reply content, dispatch failGetCompanyAccounts if it catches a failure
   */
  public setFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setGetCompanyAccountsFromApi),
      fromApiEffectSwitchMap(
        (reply, action) => setGetCompanyAccounts({ ...reply, requestId: action.requestId }),
        (error, action) => of(failGetCompanyAccounts({ error, requestId: action.requestId })),
        cancelGetCompanyAccountsRequest
      )
    )
  );

  /**
   * Update the state with the reply content, dispatch failGetCompanyAccounts if it catches a failure
   */
  public updateFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateGetCompanyAccountsFromApi),
      mergeMap((payload) =>
        from(payload.call).pipe(
          map((reply) => updateGetCompanyAccounts({ ...reply, requestId: payload.requestId })),
          catchError((err) => of(failGetCompanyAccounts({ error: err, requestId: payload.requestId })))
        )
      )
    )
  );

  constructor(protected actions$: Actions) {}
}
