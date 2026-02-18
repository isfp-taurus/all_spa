import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { from, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { fromApiEffectSwitchMap } from '@lib/store';
import {
  cancelFavoritePostRequest,
  failFavoritePost,
  setFavoritePost,
  setFavoritePostFromApi,
  updateFavoritePost,
  updateFavoritePostFromApi,
} from './favorite-post.actions';

/**
 * Service to handle async FavoritePost actions
 */
@Injectable()
export class FavoritePostEffect {
  /**
   * Set the state with the reply content, dispatch failFavoritePost if it catches a failure
   */
  public setFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setFavoritePostFromApi),
      fromApiEffectSwitchMap(
        (reply, action) => setFavoritePost({ ...reply, requestId: action.requestId }),
        (error, action) => of(failFavoritePost({ error, requestId: action.requestId })),
        cancelFavoritePostRequest
      )
    )
  );

  /**
   * Update the state with the reply content, dispatch failFavoritePost if it catches a failure
   */
  public updateFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateFavoritePostFromApi),
      mergeMap((payload) =>
        from(payload.call).pipe(
          map((reply) => updateFavoritePost({ ...reply, requestId: payload.requestId })),
          catchError((err) => of(failFavoritePost({ error: err, requestId: payload.requestId })))
        )
      )
    )
  );

  constructor(protected actions$: Actions) {}
}
