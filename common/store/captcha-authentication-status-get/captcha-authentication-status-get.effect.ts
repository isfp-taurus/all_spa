import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { from, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { fromApiEffectSwitchMap } from '@lib/store';
import {
  cancelCaptchaAuthenticationStatusGetRequest,
  failCaptchaAuthenticationStatusGet,
  setCaptchaAuthenticationStatusGet,
  setCaptchaAuthenticationStatusGetFromApi,
  updateCaptchaAuthenticationStatusGet,
  updateCaptchaAuthenticationStatusGetFromApi,
} from './captcha-authentication-status-get.actions';

/**
 * Service to handle async CaptchaAuthenticationStatusGet actions
 */
@Injectable()
export class CaptchaAuthenticationStatusGetEffect {
  /**
   * Set the state with the reply content, dispatch failCaptchaAuthenticationStatusGet if it catches a failure
   */
  public setFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setCaptchaAuthenticationStatusGetFromApi),
      fromApiEffectSwitchMap(
        (reply, action) => setCaptchaAuthenticationStatusGet({ model: reply, requestId: action.requestId }),
        (error, action) => of(failCaptchaAuthenticationStatusGet({ error, requestId: action.requestId })),
        cancelCaptchaAuthenticationStatusGetRequest
      )
    )
  );

  /**
   * Update the state with the reply content, dispatch failCaptchaAuthenticationStatusGet if it catches a failure
   */
  public updateFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateCaptchaAuthenticationStatusGetFromApi),
      mergeMap((payload) =>
        from(payload.call).pipe(
          map((reply) => updateCaptchaAuthenticationStatusGet({ model: reply, requestId: payload.requestId })),
          catchError((err) => of(failCaptchaAuthenticationStatusGet({ error: err, requestId: payload.requestId })))
        )
      )
    )
  );

  constructor(protected actions$: Actions) {}
}
