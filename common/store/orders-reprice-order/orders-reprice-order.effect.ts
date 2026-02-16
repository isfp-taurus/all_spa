import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { from, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { fromApiEffectSwitchMap } from '@lib/store';
import {
  cancelOrdersRepriceOrderRequest,
  failOrdersRepriceOrder,
  setOrdersRepriceOrder,
  setOrdersRepriceOrderFromApi,
  updateOrdersRepriceOrder,
  updateOrdersRepriceOrderFromApi,
} from './orders-reprice-order.actions';

/**
 * Service to handle async OrdersRepriceOrder actions
 */
@Injectable()
export class OrdersRepriceOrderEffect {
  /**
   * Set the state with the reply content, dispatch failOrdersRepriceOrder if it catches a failure
   */
  public setFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setOrdersRepriceOrderFromApi),
      fromApiEffectSwitchMap(
        (reply, action) => setOrdersRepriceOrder({ ...reply, requestId: action.requestId }),
        (error, action) => of(failOrdersRepriceOrder({ error, requestId: action.requestId })),
        cancelOrdersRepriceOrderRequest
      )
    )
  );

  /**
   * Update the state with the reply content, dispatch failOrdersRepriceOrder if it catches a failure
   */
  public updateFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateOrdersRepriceOrderFromApi),
      mergeMap((payload) =>
        from(payload.call).pipe(
          map((reply) => updateOrdersRepriceOrder({ ...reply, requestId: payload.requestId })),
          catchError((err) => of(failOrdersRepriceOrder({ error: err, requestId: payload.requestId })))
        )
      )
    )
  );

  constructor(protected actions$: Actions) {}
}
