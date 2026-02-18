import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { from, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { fromApiEffectSwitchMap } from '@lib/store';
import {
  cancelGetETicketItineraryReceiptRequest,
  failGetETicketItineraryReceipt,
  setGetETicketItineraryReceipt,
  setGetETicketItineraryReceiptFromApi,
  updateGetETicketItineraryReceipt,
  updateGetETicketItineraryReceiptFromApi,
} from './get-e-ticket-itinerary-receipt.actions';

/**
 * Service to handle async GetETicketItineraryReceipt actions
 */
@Injectable()
export class GetETicketItineraryReceiptEffect {
  /**
   * Set the state with the reply content, dispatch failGetETicketItineraryReceipt if it catches a failure
   */
  public setFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setGetETicketItineraryReceiptFromApi),
      fromApiEffectSwitchMap(
        (reply, action) => setGetETicketItineraryReceipt({ ...reply, requestId: action.requestId }),
        (error, action) => of(failGetETicketItineraryReceipt({ error, requestId: action.requestId })),
        cancelGetETicketItineraryReceiptRequest
      )
    )
  );

  /**
   * Update the state with the reply content, dispatch failGetETicketItineraryReceipt if it catches a failure
   */
  public updateFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateGetETicketItineraryReceiptFromApi),
      mergeMap((payload) =>
        from(payload.call).pipe(
          map((reply) => updateGetETicketItineraryReceipt({ ...reply, requestId: payload.requestId })),
          catchError((err) => of(failGetETicketItineraryReceipt({ error: err, requestId: payload.requestId })))
        )
      )
    )
  );

  constructor(protected actions$: Actions) {}
}
