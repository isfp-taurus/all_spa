import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { from, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { fromApiEffectSwitchMap } from '@lib/store';
import {
  cancelHistoryFavoriteGetRequest,
  failHistoryFavoriteGet,
  setHistoryFavoriteGet,
  setHistoryFavoriteGetFromApi,
  updateHistoryFavoriteGet,
  updateHistoryFavoriteGetFromApi,
} from './history-favorite-get.actions';

/**
 * Service to handle async HistoryFavoriteGet actions
 */
@Injectable()
export class HistoryFavoriteGetEffect {
  /**
   * Set the state with the reply content, dispatch failHistoryFavoriteGet if it catches a failure
   */
  public setFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setHistoryFavoriteGetFromApi),
      fromApiEffectSwitchMap(
        (reply, action) => setHistoryFavoriteGet({ ...reply, requestId: action.requestId }),
        (error, action) => of(failHistoryFavoriteGet({ error, requestId: action.requestId })),
        cancelHistoryFavoriteGetRequest
      )
    )
  );

  /**
   * Update the state with the reply content, dispatch failHistoryFavoriteGet if it catches a failure
   */
  public updateFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateHistoryFavoriteGetFromApi),
      mergeMap((payload) =>
        from(payload.call).pipe(
          map((reply) => updateHistoryFavoriteGet({ ...reply, requestId: payload.requestId })),
          catchError((err) => of(failHistoryFavoriteGet({ error: err, requestId: payload.requestId })))
        )
      )
    )
  );

  constructor(protected actions$: Actions) {}
}
