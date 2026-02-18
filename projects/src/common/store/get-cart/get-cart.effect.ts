import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { from } from 'rxjs/internal/observable/from';
import { of } from 'rxjs/internal/observable/of';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { fromApiEffectSwitchMap } from '@lib/store';
import {
  cancelGetCartRequest,
  failGetCart,
  setGetCart,
  setGetCartFromApi,
  updateGetCart,
  updateGetCartFromApi,
} from './get-cart.actions';

/**
 * Service to handle async GetCart actions
 */
@Injectable()
export class GetCartEffect {
  /**
   * Set the state with the reply content, dispatch failGetCart if it catches a failure
   */
  public setFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setGetCartFromApi),
      fromApiEffectSwitchMap(
        (reply, action) => setGetCart({ ...reply, requestId: action.requestId }),
        (error, action) => of(failGetCart({ error, requestId: action.requestId })),
        cancelGetCartRequest
      )
    )
  );

  /**
   * Update the state with the reply content, dispatch failGetCart if it catches a failure
   */
  public updateFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateGetCartFromApi),
      mergeMap((payload) =>
        from(payload.call).pipe(
          map((reply) => updateGetCart({ ...reply, requestId: payload.requestId })),
          catchError((err) => of(failGetCart({ error: err, requestId: payload.requestId })))
        )
      )
    )
  );

  constructor(protected actions$: Actions) {}
}
