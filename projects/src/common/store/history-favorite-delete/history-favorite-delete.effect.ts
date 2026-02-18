import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { from, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { fromApiEffectSwitchMap } from '@lib/store';
import {
  cancelHistoryFavoriteDeleteRequest,
  failHistoryFavoriteDelete,
  setHistoryFavoriteDelete,
  setHistoryFavoriteDeleteFromApi,
  updateHistoryFavoriteDelete,
  updateHistoryFavoriteDeleteFromApi,
} from './history-favorite-delete.actions';

/**
 * Service to handle async HistoryFavoriteDelete actions
 */
@Injectable()
export class HistoryFavoriteDeleteEffect {
  /**
   * Set the state with the reply content, dispatch failHistoryFavoriteDelete if it catches a failure
   */
  public setFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setHistoryFavoriteDeleteFromApi),
      fromApiEffectSwitchMap(
        (reply, action) => setHistoryFavoriteDelete({ ...reply, requestId: action.requestId }),
        (error, action) => of(failHistoryFavoriteDelete({ error, requestId: action.requestId })),
        cancelHistoryFavoriteDeleteRequest
      )
    )
  );

  /**
   * Update the state with the reply content, dispatch failHistoryFavoriteDelete if it catches a failure
   */
  public updateFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateHistoryFavoriteDeleteFromApi),
      mergeMap((payload) =>
        from(payload.call).pipe(
          map((reply) => updateHistoryFavoriteDelete({ ...reply, requestId: payload.requestId })),
          catchError((err) => of(failHistoryFavoriteDelete({ error: err, requestId: payload.requestId })))
        )
      )
    )
  );

  constructor(protected actions$: Actions) {}
}
