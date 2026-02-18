import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { fromApiEffectSwitchMap } from '../common';
import { cancelSysdateRequest, failSysdate, setSysdate, setSysdateFromApi } from './sysdate.actions';

/**
 * Service to handle async Sysdate actions
 */
@Injectable()
export class SysdateEffect {
  /**
   * Set the state with the reply content, dispatch failSysdate if it catches a failure
   */
  public setFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setSysdateFromApi),
      fromApiEffectSwitchMap(
        (reply, action) => setSysdate({ model: reply, requestId: action.requestId }),
        (error, action) => of(failSysdate({ error, requestId: action.requestId })),
        cancelSysdateRequest
      )
    )
  );

  constructor(protected actions$: Actions) {}
}
