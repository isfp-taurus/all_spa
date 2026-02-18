import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { from, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { fromApiEffectSwitchMap } from '@lib/store';
import {
  cancelHistoryFavoriteGetResponseRequest,
  failHistoryFavoriteGetResponse,
  setHistoryFavoriteGetResponse,
  setHistoryFavoriteGetResponseFromApi,
  updateHistoryFavoriteGetResponse,
  updateHistoryFavoriteGetResponseFromApi,
} from './history-favorite-get-response/history-favorite-get-response.actions';

/**
 * Service to handle async HistoryFavoriteGetResponse actions
 */
@Injectable()
export class HistoryFavoriteGetResponseEffect {
  /**
   * Set the state with the reply content, dispatch failHistoryFavoriteGetResponse if it catches a failure
   */
  public setFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setHistoryFavoriteGetResponseFromApi),
      fromApiEffectSwitchMap(
        (reply, action) => setHistoryFavoriteGetResponse({ model: reply, requestId: action.requestId }),
        (error, action) => of(failHistoryFavoriteGetResponse({ error, requestId: action.requestId })),
        cancelHistoryFavoriteGetResponseRequest
      )
    )
  );

  /**
   * Update the state with the reply content, dispatch failHistoryFavoriteGetResponse if it catches a failure
   */
  public updateFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateHistoryFavoriteGetResponseFromApi),
      mergeMap((payload) =>
        from(payload.call).pipe(
          map((reply) => updateHistoryFavoriteGetResponse({ model: reply, requestId: payload.requestId })),
          catchError((err) => of(failHistoryFavoriteGetResponse({ error: err, requestId: payload.requestId })))
        )
      )
    )
  );

  constructor(protected actions$: Actions) {}
}
