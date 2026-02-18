import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { from, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { fromApiEffectSwitchMap } from '@lib/store';
import {
  cancelPaymentInputRequest,
  failPaymentInput,
  setPaymentInput,
  setPaymentInputFromApi,
  updatePaymentInput,
  updatePaymentInputFromApi,
} from './payment-input.actions';

/**
 * Service to handle async PaymentInput actions
 */
@Injectable()
export class PaymentInputEffect {
  /**
   * Set the state with the reply content, dispatch failPaymentInput if it catches a failure
   */
  public setFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setPaymentInputFromApi),
      fromApiEffectSwitchMap(
        (reply, action) => setPaymentInput({ ...reply, requestId: action.requestId }),
        (error, action) => of(failPaymentInput({ error, requestId: action.requestId })),
        cancelPaymentInputRequest
      )
    )
  );

  /**
   * Update the state with the reply content, dispatch failPaymentInput if it catches a failure
   */
  public updateFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updatePaymentInputFromApi),
      mergeMap((payload) =>
        from(payload.call).pipe(
          map((reply) => updatePaymentInput({ ...reply, requestId: payload.requestId })),
          catchError((err) => of(failPaymentInput({ error: err, requestId: payload.requestId })))
        )
      )
    )
  );

  constructor(protected actions$: Actions) {}
}
