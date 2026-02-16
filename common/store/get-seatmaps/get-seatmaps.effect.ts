import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { cancelGettingSeatmaps, failGettingSeatmaps, setSeatmaps, setSeatmapsFromApi } from './get-seatmaps.actions';
import { fromApiEffectSwitchMap } from '@lib/store';
import { of } from 'rxjs';

@Injectable()
export class GetSeatmapsEffect {
  constructor(private actions$: Actions) {}

  public setFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setSeatmapsFromApi),
      fromApiEffectSwitchMap(
        (reply, action) => setSeatmaps({ ...reply, requestId: action.requestId }),
        (error, action) => of(failGettingSeatmaps({ error, requestId: action.requestId })),
        cancelGettingSeatmaps
      )
    )
  );
}
