import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { from, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { fromApiEffectSwitchMap } from '@lib/store';
import {
  cancelHistoryFavoriteGetShowRequest,
  failHistoryFavoriteGetShow,
  setHistoryFavoriteGetShow,
  setHistoryFavoriteGetShowFromApi,
  updateHistoryFavoriteGetShow,
  updateHistoryFavoriteGetShowFromApi,
} from './history-favorite-get-show.actions';

/**
 * Service to handle async HistoryFavoriteGetShow actions
 */
@Injectable()
export class HistoryFavoriteGetShowEffect {
  /**
   * Set the state with the reply content, dispatch failHistoryFavoriteGetShow if it catches a failure
   */
  public setFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setHistoryFavoriteGetShowFromApi),
      fromApiEffectSwitchMap(
        (reply, action) => setHistoryFavoriteGetShow({ ...reply, requestId: action.requestId }),
        (error, action) => of(failHistoryFavoriteGetShow({ error, requestId: action.requestId })),
        cancelHistoryFavoriteGetShowRequest
      )
    )
  );

  /**
   * Update the state with the reply content, dispatch failHistoryFavoriteGetShow if it catches a failure
   */
  public updateFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateHistoryFavoriteGetShowFromApi),
      mergeMap((payload) =>
        from(payload.call).pipe(
          map((reply) => updateHistoryFavoriteGetShow({ ...reply, requestId: payload.requestId })),
          catchError((err) => of(failHistoryFavoriteGetShow({ error: err, requestId: payload.requestId })))
        )
      )
    )
  );

  constructor(protected actions$: Actions) {}
}
