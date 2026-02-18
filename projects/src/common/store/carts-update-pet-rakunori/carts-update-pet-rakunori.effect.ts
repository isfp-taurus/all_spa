import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { from, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { fromApiEffectSwitchMap } from '@lib/store';
import {
  cancelCartsUpdatePetRakunoriRequest,
  failCartsUpdatePetRakunori,
  setCartsUpdatePetRakunori,
  setCartsUpdatePetRakunoriFromApi,
  updateCartsUpdatePetRakunori,
  updateCartsUpdatePetRakunoriFromApi,
} from './carts-update-pet-rakunori.actions';

/**
 * Service to handle async CartsUpdatePetRakunori actions
 */
@Injectable()
export class CartsUpdatePetRakunoriEffect {
  /**
   * Set the state with the reply content, dispatch failCartsUpdatePetRakunori if it catches a failure
   */
  public setFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setCartsUpdatePetRakunoriFromApi),
      fromApiEffectSwitchMap(
        (reply, action) => setCartsUpdatePetRakunori({ ...reply, requestId: action.requestId }),
        (error, action) => of(failCartsUpdatePetRakunori({ error, requestId: action.requestId })),
        cancelCartsUpdatePetRakunoriRequest
      )
    )
  );

  /**
   * Update the state with the reply content, dispatch failCartsUpdatePetRakunori if it catches a failure
   */
  public updateFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateCartsUpdatePetRakunoriFromApi),
      mergeMap((payload) =>
        from(payload.call).pipe(
          map((reply) => updateCartsUpdatePetRakunori({ ...reply, requestId: payload.requestId })),
          catchError((err) => of(failCartsUpdatePetRakunori({ error: err, requestId: payload.requestId })))
        )
      )
    )
  );

  constructor(protected actions$: Actions) {}
}
