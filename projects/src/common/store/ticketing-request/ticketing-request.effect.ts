import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { from, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { fromApiEffectSwitchMap } from '@lib/store';
import {
  cancelTicketingRequestRequest,
  failTicketingRequest,
  setTicketingRequest,
  setTicketingRequestFromApi,
  updateTicketingRequest,
  updateTicketingRequestFromApi,
} from './ticketing-request.actions';

/**
 * Service to handle async TicketingRequest actions
 */
@Injectable()
export class TicketingRequestEffect {
  /**
   * Set the state with the reply content, dispatch failTicketingRequest if it catches a failure
   */
  public setFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setTicketingRequestFromApi),
      fromApiEffectSwitchMap(
        (reply, action) => setTicketingRequest({ ...reply, requestId: action.requestId }),
        (error, action) => of(failTicketingRequest({ error, requestId: action.requestId })),
        cancelTicketingRequestRequest
      )
    )
  );

  /**
   * Update the state with the reply content, dispatch failTicketingRequest if it catches a failure
   */
  public updateFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateTicketingRequestFromApi),
      mergeMap((payload) =>
        from(payload.call).pipe(
          map((reply) => updateTicketingRequest({ ...reply, requestId: payload.requestId })),
          catchError((err) => of(failTicketingRequest({ error: err, requestId: payload.requestId })))
        )
      )
    )
  );

  constructor(protected actions$: Actions) {}
}
