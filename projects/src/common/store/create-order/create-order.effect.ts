import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { from } from 'rxjs/internal/observable/from';
import { of } from 'rxjs/internal/observable/of';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { fromApiEffectSwitchMap } from '@lib/store';
import {
  cancelCreateOrderRequest,
  failCreateOrder,
  setCreateOrder,
  setCreateOrderFromApi,
  updateCreateOrder,
  updateCreateOrderFromApi,
} from './create-order.actions';

/**
 * Service to handle async CreateOrder actions
 */
@Injectable()
export class CreateOrderEffect {
  /**
   * Set the state with the reply content, dispatch failCreateOrder if it catches a failure
   */
  public setFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setCreateOrderFromApi),
      fromApiEffectSwitchMap(
        (reply, action) => setCreateOrder({ ...reply, requestId: action.requestId }),
        (error, action) => of(failCreateOrder({ error, requestId: action.requestId })),
        cancelCreateOrderRequest
      )
    )
  );

  /**
   * Update the state with the reply content, dispatch failCreateOrder if it catches a failure
   */
  public updateFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateCreateOrderFromApi),
      mergeMap((payload) =>
        from(payload.call).pipe(
          map((reply) => updateCreateOrder({ ...reply, requestId: payload.requestId })),
          catchError((err) => of(failCreateOrder({ error: err, requestId: payload.requestId })))
        )
      )
    )
  );

  constructor(protected actions$: Actions) {}
}
