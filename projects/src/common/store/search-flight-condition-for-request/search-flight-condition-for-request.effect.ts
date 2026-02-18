import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { from, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { fromApiEffectSwitchMap } from '@lib/store';
import {
  cancelSearchFlightConditionForRequestRequest,
  failSearchFlightConditionForRequest,
  setSearchFlightConditionForRequest,
  setSearchFlightConditionForRequestFromApi,
  updateSearchFlightConditionForRequest,
  updateSearchFlightConditionForRequestFromApi,
} from './search-flight-condition-for-request.actions';

/**
 * Service to handle async SearchFlightConditionForRequest actions
 */
@Injectable()
export class SearchFlightConditionForRequestEffect {
  /**
   * Set the state with the reply content, dispatch failSearchFlightConditionForRequest if it catches a failure
   */
  public setFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setSearchFlightConditionForRequestFromApi),
      fromApiEffectSwitchMap(
        (reply, action) => setSearchFlightConditionForRequest({ ...reply, requestId: action.requestId }),
        (error, action) => of(failSearchFlightConditionForRequest({ error, requestId: action.requestId })),
        cancelSearchFlightConditionForRequestRequest
      )
    )
  );

  /**
   * Update the state with the reply content, dispatch failSearchFlightConditionForRequest if it catches a failure
   */
  public updateFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateSearchFlightConditionForRequestFromApi),
      mergeMap((payload) =>
        from(payload.call).pipe(
          map((reply) => updateSearchFlightConditionForRequest({ ...reply, requestId: payload.requestId })),
          catchError((err) => of(failSearchFlightConditionForRequest({ error: err, requestId: payload.requestId })))
        )
      )
    )
  );

  constructor(protected actions$: Actions) {}
}
