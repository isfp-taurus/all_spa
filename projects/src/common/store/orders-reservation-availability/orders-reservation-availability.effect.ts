import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { from, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { fromApiEffectSwitchMap } from '@lib/store';
import {
  cancelOrdersReservationAvailabilityRequest,
  failOrdersReservationAvailability,
  setOrdersReservationAvailability,
  setOrdersReservationAvailabilityFromApi,
  updateOrdersReservationAvailability,
  updateOrdersReservationAvailabilityFromApi,
} from './orders-reservation-availability.actions';

/**
 * Service to handle async OrdersReservationAvailability actions
 */
@Injectable()
export class OrdersReservationAvailabilityEffect {
  /**
   * Set the state with the reply content, dispatch failOrdersReservationAvailability if it catches a failure
   */
  public setFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setOrdersReservationAvailabilityFromApi),
      fromApiEffectSwitchMap(
        (reply, action) => setOrdersReservationAvailability({ model: reply, requestId: action.requestId }),
        (error, action) => of(failOrdersReservationAvailability({ error, requestId: action.requestId })),
        cancelOrdersReservationAvailabilityRequest
      )
    )
  );

  /**
   * Update the state with the reply content, dispatch failOrdersReservationAvailability if it catches a failure
   */
  public updateFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateOrdersReservationAvailabilityFromApi),
      mergeMap((payload) =>
        from(payload.call).pipe(
          map((reply) => updateOrdersReservationAvailability({ model: reply, requestId: payload.requestId })),
          catchError((err) => of(failOrdersReservationAvailability({ error: err, requestId: payload.requestId })))
        )
      )
    )
  );

  constructor(protected actions$: Actions) {}
}
