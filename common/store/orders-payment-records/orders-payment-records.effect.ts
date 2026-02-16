import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { from, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { fromApiEffectSwitchMap } from '@lib/store';
import {
  cancelOrdersPaymentRecordsRequest,
  failOrdersPaymentRecords,
  setOrdersPaymentRecords,
  setOrdersPaymentRecordsFromApi,
  updateOrdersPaymentRecords,
  updateOrdersPaymentRecordsFromApi,
} from './orders-payment-records.actions';

/**
 * Service to handle async OrdersPaymentRecords actions
 */
@Injectable()
export class OrdersPaymentRecordsEffect {
  /**
   * Set the state with the reply content, dispatch failOrdersPaymentRecords if it catches a failure
   */
  public setFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setOrdersPaymentRecordsFromApi),
      fromApiEffectSwitchMap(
        (reply, action) => setOrdersPaymentRecords({ ...reply, requestId: action.requestId }),
        (error, action) => of(failOrdersPaymentRecords({ error, requestId: action.requestId })),
        cancelOrdersPaymentRecordsRequest
      )
    )
  );

  /**
   * Update the state with the reply content, dispatch failOrdersPaymentRecords if it catches a failure
   */
  public updateFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateOrdersPaymentRecordsFromApi),
      mergeMap((payload) =>
        from(payload.call).pipe(
          map((reply) => updateOrdersPaymentRecords({ ...reply, requestId: payload.requestId })),
          catchError((err) => of(failOrdersPaymentRecords({ error: err, requestId: payload.requestId })))
        )
      )
    )
  );

  constructor(protected actions$: Actions) {}
}
