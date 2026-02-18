import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { from, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { fromApiEffectSwitchMap } from '@lib/store';
import {
  cancelUpdateServicesRequest,
  failUpdateServices,
  setUpdateServices,
  setUpdateServicesFromApi,
  updateUpdateServices,
  updateUpdateServicesFromApi,
} from './update-services.actions';

/**
 * Service to handle async UpdateServices actions
 */
@Injectable()
export class UpdateServicesEffect {
  /**
   * Set the state with the reply content, dispatch failUpdateServices if it catches a failure
   */
  public setFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setUpdateServicesFromApi),
      fromApiEffectSwitchMap(
        (reply, action) => setUpdateServices({ ...reply, requestId: action.requestId }),
        (error, action) => of(failUpdateServices({ error, requestId: action.requestId })),
        cancelUpdateServicesRequest
      )
    )
  );

  /**
   * Update the state with the reply content, dispatch failUpdateServices if it catches a failure
   */
  public updateFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateUpdateServicesFromApi),
      mergeMap((payload) =>
        from(payload.call).pipe(
          map((reply) => updateUpdateServices({ ...reply, requestId: payload.requestId })),
          catchError((err) => of(failUpdateServices({ error: err, requestId: payload.requestId })))
        )
      )
    )
  );

  constructor(protected actions$: Actions) {}
}
