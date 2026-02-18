import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { from, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { fromApiEffectSwitchMap } from '@lib/store';
import {
  cancelCaptchaAuthenticationPostRequest,
  failCaptchaAuthenticationPost,
  setCaptchaAuthenticationPost,
  setCaptchaAuthenticationPostFromApi,
  updateCaptchaAuthenticationPost,
  updateCaptchaAuthenticationPostFromApi,
} from './captcha-authentication-post.actions';

/**
 * Service to handle async CaptchaAuthenticationPost actions
 */
@Injectable()
export class CaptchaAuthenticationPostEffect {
  /**
   * Set the state with the reply content, dispatch failCaptchaAuthenticationPost if it catches a failure
   */
  public setFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setCaptchaAuthenticationPostFromApi),
      fromApiEffectSwitchMap(
        (reply, action) => setCaptchaAuthenticationPost({ ...reply, requestId: action.requestId }),
        (error, action) => of(failCaptchaAuthenticationPost({ error, requestId: action.requestId })),
        cancelCaptchaAuthenticationPostRequest
      )
    )
  );

  /**
   * Update the state with the reply content, dispatch failCaptchaAuthenticationPost if it catches a failure
   */
  public updateFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateCaptchaAuthenticationPostFromApi),
      mergeMap((payload) =>
        from(payload.call).pipe(
          map((reply) => updateCaptchaAuthenticationPost({ ...reply, requestId: payload.requestId })),
          catchError((err) => of(failCaptchaAuthenticationPost({ error: err, requestId: payload.requestId })))
        )
      )
    )
  );

  constructor(protected actions$: Actions) {}
}
