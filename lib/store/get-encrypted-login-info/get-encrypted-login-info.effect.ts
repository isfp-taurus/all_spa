import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { from, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { fromApiEffectSwitchMap } from '../common';
import {
  cancelGetEncryptedLoginInfoRequest,
  failGetEncryptedLoginInfo,
  setGetEncryptedLoginInfo,
  setGetEncryptedLoginInfoFromApi,
  updateGetEncryptedLoginInfo,
  updateGetEncryptedLoginInfoFromApi,
} from './get-encrypted-login-info.actions';

/**
 * Service to handle async GetEncryptedLoginInfo actions
 */
@Injectable()
export class GetEncryptedLoginInfoEffect {
  /**
   * Set the state with the reply content, dispatch failGetEncryptedLoginInfo if it catches a failure
   */
  public setFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setGetEncryptedLoginInfoFromApi),
      fromApiEffectSwitchMap(
        (reply, action) => setGetEncryptedLoginInfo({ model: reply, requestId: action.requestId }),
        (error, action) => of(failGetEncryptedLoginInfo({ error, requestId: action.requestId })),
        cancelGetEncryptedLoginInfoRequest
      )
    )
  );

  /**
   * Update the state with the reply content, dispatch failGetEncryptedLoginInfo if it catches a failure
   */
  public updateFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateGetEncryptedLoginInfoFromApi),
      mergeMap((payload) =>
        from(payload.call).pipe(
          map((reply) => updateGetEncryptedLoginInfo({ model: reply, requestId: payload.requestId })),
          catchError((err) => of(failGetEncryptedLoginInfo({ error: err, requestId: payload.requestId })))
        )
      )
    )
  );

  constructor(protected actions$: Actions) {}
}
