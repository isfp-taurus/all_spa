import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { from } from 'rxjs/internal/observable/from';
import { of } from 'rxjs/internal/observable/of';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { fromApiEffectSwitchMap } from '@lib/store';
import {
  cancelCreateCartRequest,
  failCreateCart,
  setCreateCart,
  setCreateCartFromApi,
  updateCreateCart,
  updateCreateCartFromApi,
} from './create-cart.actions';

/**
 * Service to handle async CreateCart actions
 */
@Injectable()
export class CreateCartEffect {
  /**
   * Set the state with the reply content, dispatch failCreateCart if it catches a failure
   */
  public setFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setCreateCartFromApi),
      fromApiEffectSwitchMap(
        (reply, action) => setCreateCart({ ...reply, requestId: action.requestId }),
        (error, action) => of(failCreateCart({ error, requestId: action.requestId })),
        cancelCreateCartRequest
      )
    )
  );

  /**
   * Update the state with the reply content, dispatch failCreateCart if it catches a failure
   */
  public updateFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateCreateCartFromApi),
      mergeMap((payload) =>
        from(payload.call).pipe(
          map((reply) => updateCreateCart({ ...reply, requestId: payload.requestId })),
          catchError((err) => of(failCreateCart({ error: err, requestId: payload.requestId })))
        )
      )
    )
  );

  constructor(protected actions$: Actions) {}
}
