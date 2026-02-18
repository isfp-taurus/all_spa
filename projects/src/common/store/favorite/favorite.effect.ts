import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { from, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { fromApiEffectSwitchMap } from '@lib/store';
import {
  cancelFavoriteRequest,
  failFavorite,
  setFavorite,
  setFavoriteFromApi,
  updateFavorite,
  updateFavoriteFromApi,
} from './favorite.actions';

/**
 * Service to handle async Favorite actions
 */
@Injectable()
export class FavoriteEffect {
  /**
   * Set the state with the reply content, dispatch failFavorite if it catches a failure
   */
  public setFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setFavoriteFromApi),
      fromApiEffectSwitchMap(
        (reply, action) => setFavorite({ ...reply, requestId: action.requestId }),
        (error, action) => of(failFavorite({ error, requestId: action.requestId })),
        cancelFavoriteRequest
      )
    )
  );

  /**
   * Update the state with the reply content, dispatch failFavorite if it catches a failure
   */
  public updateFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateFavoriteFromApi),
      mergeMap((payload) =>
        from(payload.call).pipe(
          map((reply) => updateFavorite({ ...reply, requestId: payload.requestId })),
          catchError((err) => of(failFavorite({ error: err, requestId: payload.requestId })))
        )
      )
    )
  );

  constructor(protected actions$: Actions) {}
}
