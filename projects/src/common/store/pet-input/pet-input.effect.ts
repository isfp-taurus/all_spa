import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { from, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { fromApiEffectSwitchMap } from '@lib/store';
import {
  cancelPetInputRequest,
  failPetInput,
  setPetInput,
  setPetInputFromApi,
  updatePetInput,
  updatePetInputFromApi,
} from './pet-input.actions';

/**
 * Service to handle async PetInput actions
 */
@Injectable()
export class PetInputEffect {
  /**
   * Set the state with the reply content, dispatch failPetInput if it catches a failure
   */
  public setFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setPetInputFromApi),
      fromApiEffectSwitchMap(
        (reply, action) => setPetInput({ ...reply, requestId: action.requestId }),
        (error, action) => of(failPetInput({ error, requestId: action.requestId })),
        cancelPetInputRequest
      )
    )
  );

  /**
   * Update the state with the reply content, dispatch failPetInput if it catches a failure
   */
  public updateFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updatePetInputFromApi),
      mergeMap((payload) =>
        from(payload.call).pipe(
          map((reply) => updatePetInput({ ...reply, requestId: payload.requestId })),
          catchError((err) => of(failPetInput({ error: err, requestId: payload.requestId })))
        )
      )
    )
  );

  constructor(protected actions$: Actions) {}
}
