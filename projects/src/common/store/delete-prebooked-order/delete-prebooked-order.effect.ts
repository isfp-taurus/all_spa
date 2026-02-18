import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { from } from 'rxjs/internal/observable/from';
import { of } from 'rxjs/internal/observable/of';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { fromApiEffectSwitchMap } from '@lib/store';
import {
  cancelDeletePrebookedOrderRequest,
  failDeletePrebookedOrder,
  setDeletePrebookedOrder,
  setDeletePrebookedOrderFromApi,
  updateDeletePrebookedOrder,
  updateDeletePrebookedOrderFromApi,
} from './delete-prebooked-order.actions';

/**
 * Service to handle async DeletePrebookedOrder actions
 */
@Injectable()
export class DeletePrebookedOrderEffect {
  /**
   * Set the state with the reply content, dispatch failDeletePrebookedOrder if it catches a failure
   */
  public setFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setDeletePrebookedOrderFromApi),
      fromApiEffectSwitchMap(
        (reply, action) => setDeletePrebookedOrder({ ...reply, requestId: action.requestId }),
        (error, action) => of(failDeletePrebookedOrder({ error, requestId: action.requestId })),
        cancelDeletePrebookedOrderRequest
      )
    )
  );

  /**
   * Update the state with the reply content, dispatch failDeletePrebookedOrder if it catches a failure
   */
  public updateFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateDeletePrebookedOrderFromApi),
      mergeMap((payload) =>
        from(payload.call).pipe(
          map((reply) => updateDeletePrebookedOrder({ ...reply, requestId: payload.requestId })),
          catchError((err) => of(failDeletePrebookedOrder({ error: err, requestId: payload.requestId })))
        )
      )
    )
  );

  constructor(protected actions$: Actions) {}
}
