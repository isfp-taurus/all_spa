import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { from, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { fromApiEffectSwitchMap } from '@lib/store';
import {
  cancelGetOrderRequest,
  failGetOrder,
  setGetOrder,
  setGetOrderFromApi,
  updateGetOrder,
  updateGetOrderFromApi,
} from './get-order.actions';

/**
 * Service to handle async GetOrder actions
 */
@Injectable()
export class GetOrderEffect {
  /**
   * Set the state with the reply content, dispatch failGetOrder if it catches a failure
   */
  public setFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setGetOrderFromApi),
      fromApiEffectSwitchMap(
        (reply, action) => setGetOrder({ ...reply, requestId: action.requestId }),
        (error, action) => of(failGetOrder({ error, requestId: action.requestId })),
        cancelGetOrderRequest
      )
    )
  );

  /**
   * Update the state with the reply content, dispatch failGetOrder if it catches a failure
   */
  public updateFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateGetOrderFromApi),
      mergeMap((payload) =>
        from(payload.call).pipe(
          map((reply) => updateGetOrder({ ...reply, requestId: payload.requestId })),
          catchError((err) => of(failGetOrder({ error: err, requestId: payload.requestId })))
        )
      )
    )
  );

  constructor(protected actions$: Actions) {}
}
