import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { from, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { fromApiEffectSwitchMap } from '../common';
import {
  cancelGetMemberInformationRequest,
  failGetMemberInformation,
  setGetMemberInformation,
  setGetMemberInformationFromApi,
  updateGetMemberInformation,
  updateGetMemberInformationFromApi,
} from './get-member-information.actions';

/**
 * Service to handle async GetMemberInformation actions
 */
@Injectable()
export class GetMemberInformationEffect {
  /**
   * Set the state with the reply content, dispatch failGetMemberInformation if it catches a failure
   */
  public setFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setGetMemberInformationFromApi),
      fromApiEffectSwitchMap(
        (reply, action) => setGetMemberInformation({ model: reply, requestId: action.requestId }),
        (error, action) => of(failGetMemberInformation({ error, requestId: action.requestId })),
        cancelGetMemberInformationRequest
      )
    )
  );

  /**
   * Update the state with the reply content, dispatch failGetMemberInformation if it catches a failure
   */
  public updateFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateGetMemberInformationFromApi),
      mergeMap((payload) =>
        from(payload.call).pipe(
          map((reply) => updateGetMemberInformation({ model: reply, requestId: payload.requestId })),
          catchError((err) => of(failGetMemberInformation({ error: err, requestId: payload.requestId })))
        )
      )
    )
  );

  constructor(protected actions$: Actions) {}
}
