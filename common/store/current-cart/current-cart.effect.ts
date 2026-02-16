import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { from } from 'rxjs/internal/observable/from';
import { of } from 'rxjs/internal/observable/of';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { fromApiEffectSwitchMap } from '@lib/store';
import {
  cancelCurrentCartRequest,
  failCurrentCart,
  setCurrentCart,
  setCurrentCartFromApi,
  updateCurrentCart,
  updateCurrentCartFromApi,
} from './current-cart.actions';

/**
 * Service to handle async CurrentCart actions
 */
@Injectable()
export class CurrentCartEffect {
  /**
   * Set the state with the reply content, dispatch failCurrentCart if it catches a failure
   */
  public setFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setCurrentCartFromApi),
      fromApiEffectSwitchMap(
        (reply, action) => setCurrentCart({ ...reply, requestId: action.requestId }),
        (error, action) => of(failCurrentCart({ error, requestId: action.requestId })),
        cancelCurrentCartRequest
      )
    )
  );

  /**
   * Update the state with the reply content, dispatch failCurrentCart if it catches a failure
   */
  public updateFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateCurrentCartFromApi),
      mergeMap((payload) =>
        from(payload.call).pipe(
          map((reply) => updateCurrentCart({ ...reply, requestId: payload.requestId })),
          catchError((err) => of(failCurrentCart({ error: err, requestId: payload.requestId })))
        )
      )
    )
  );

  constructor(protected actions$: Actions) {}
}
