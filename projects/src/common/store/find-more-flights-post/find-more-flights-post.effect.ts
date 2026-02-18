import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { from } from 'rxjs/internal/observable/from';
import { of } from 'rxjs/internal/observable/of';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { fromApiEffectSwitchMap } from '@lib/store';
import {
  cancelFindMoreFlightsPostRequest,
  failFindMoreFlightsPost,
  setFindMoreFlightsPost,
  setFindMoreFlightsPostFromApi,
  updateFindMoreFlightsPost,
  updateFindMoreFlightsPostFromApi,
} from './find-more-flights-post.actions';

/**
 * Service to handle async FindMoreFlightsPost actions
 */
@Injectable()
export class FindMoreFlightsPostEffect {
  /**
   * Set the state with the reply content, dispatch failFindMoreFlightsPost if it catches a failure
   */
  public setFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setFindMoreFlightsPostFromApi),
      fromApiEffectSwitchMap(
        (reply, action) => setFindMoreFlightsPost({ ...reply, requestId: action.requestId }),
        (error, action) => of(failFindMoreFlightsPost({ error, requestId: action.requestId })),
        cancelFindMoreFlightsPostRequest
      )
    )
  );

  /**
   * Update the state with the reply content, dispatch failFindMoreFlightsPost if it catches a failure
   */
  public updateFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateFindMoreFlightsPostFromApi),
      mergeMap((payload) =>
        from(payload.call).pipe(
          map((reply) => updateFindMoreFlightsPost({ ...reply, requestId: payload.requestId })),
          catchError((err) => of(failFindMoreFlightsPost({ error: err, requestId: payload.requestId })))
        )
      )
    )
  );

  constructor(protected actions$: Actions) {}
}
