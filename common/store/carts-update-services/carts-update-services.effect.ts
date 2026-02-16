import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { from, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { fromApiEffectSwitchMap } from '@lib/store';
import {
  cancelCartsUpdateServicesRequest,
  failCartsUpdateServices,
  setCartsUpdateServices,
  setCartsUpdateServicesFromApi,
  updateCartsUpdateServices,
  updateCartsUpdateServicesFromApi,
} from './carts-update-services.actions';

/**
 * Service to handle async CartsUpdateServices actions
 */
@Injectable()
export class CartsUpdateServicesEffect {
  /**
   * Set the state with the reply content, dispatch failCartsUpdateServices if it catches a failure
   */
  public setFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setCartsUpdateServicesFromApi),
      fromApiEffectSwitchMap(
        (reply, action) => setCartsUpdateServices({ ...reply, requestId: action.requestId }),
        (error, action) => of(failCartsUpdateServices({ error, requestId: action.requestId })),
        cancelCartsUpdateServicesRequest
      )
    )
  );

  /**
   * Update the state with the reply content, dispatch failCartsUpdateServices if it catches a failure
   */
  public updateFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateCartsUpdateServicesFromApi),
      mergeMap((payload) =>
        from(payload.call).pipe(
          map((reply) => updateCartsUpdateServices({ ...reply, requestId: payload.requestId })),
          catchError((err) => of(failCartsUpdateServices({ error: err, requestId: payload.requestId })))
        )
      )
    )
  );

  constructor(protected actions$: Actions) {}
}
