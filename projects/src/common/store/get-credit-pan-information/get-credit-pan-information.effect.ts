import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { from, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { fromApiEffectSwitchMap } from '@lib/store';
import {
  cancelGetCreditPanInformationRequest,
  failGetCreditPanInformation,
  setGetCreditPanInformation,
  setGetCreditPanInformationFromApi,
  updateGetCreditPanInformation,
  updateGetCreditPanInformationFromApi,
} from './get-credit-pan-information.actions';

/**
 * Service to handle async GetCreditPanInformation actions
 */
@Injectable()
export class GetCreditPanInformationEffect {
  /**
   * Set the state with the reply content, dispatch failGetCreditPanInformation if it catches a failure
   */
  public setFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setGetCreditPanInformationFromApi),
      fromApiEffectSwitchMap(
        (reply, action) => setGetCreditPanInformation({ model: reply, requestId: action.requestId }),
        (error, action) => of(failGetCreditPanInformation({ error, requestId: action.requestId })),
        cancelGetCreditPanInformationRequest
      )
    )
  );

  /**
   * Update the state with the reply content, dispatch failGetCreditPanInformation if it catches a failure
   */
  public updateFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateGetCreditPanInformationFromApi),
      mergeMap((payload) =>
        from(payload.call).pipe(
          map((reply) => updateGetCreditPanInformation({ model: reply, requestId: payload.requestId })),
          catchError((err) => of(failGetCreditPanInformation({ error: err, requestId: payload.requestId })))
        )
      )
    )
  );

  constructor(protected actions$: Actions) {}
}
