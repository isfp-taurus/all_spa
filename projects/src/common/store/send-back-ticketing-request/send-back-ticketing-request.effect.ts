import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { from, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { fromApiEffectSwitchMap } from '@lib/store';
import {
  cancelSendBackTicketingRequestRequest,
  failSendBackTicketingRequest,
  setSendBackTicketingRequest,
  setSendBackTicketingRequestFromApi,
  updateSendBackTicketingRequest,
  updateSendBackTicketingRequestFromApi,
} from './send-back-ticketing-request.actions';

/**
 * Service to handle async SendBackTicketingRequest actions
 */
@Injectable()
export class SendBackTicketingRequestEffect {
  /**
   * Set the state with the reply content, dispatch failSendBackTicketingRequest if it catches a failure
   */
  public setFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setSendBackTicketingRequestFromApi),
      fromApiEffectSwitchMap(
        (reply, action) => setSendBackTicketingRequest({ ...reply, requestId: action.requestId }),
        (error, action) => of(failSendBackTicketingRequest({ error, requestId: action.requestId })),
        cancelSendBackTicketingRequestRequest
      )
    )
  );

  /**
   * Update the state with the reply content, dispatch failSendBackTicketingRequest if it catches a failure
   */
  public updateFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateSendBackTicketingRequestFromApi),
      mergeMap((payload) =>
        from(payload.call).pipe(
          map((reply) => updateSendBackTicketingRequest({ ...reply, requestId: payload.requestId })),
          catchError((err) => of(failSendBackTicketingRequest({ error: err, requestId: payload.requestId })))
        )
      )
    )
  );

  constructor(protected actions$: Actions) {}
}
