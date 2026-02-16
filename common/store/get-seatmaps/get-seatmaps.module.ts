import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { GetSeatmapsEffect } from './get-seatmaps.effect';
import { seatmapsReducer } from './get-seatmaps.reducer';
import { SEATMAPS_STATE, SeatmapsState } from './get-seatmaps.state';

/** Token of the GetOrder reducer */
export const SEATMAPS_REDUCER_TOKEN = new InjectionToken<ActionReducer<SeatmapsState, Action>>(
  'Feature Seatmaps Reducer'
);

/** Provide default reducer for GetOrder store */
export function getSeatmapsReducer() {
  return seatmapsReducer;
}

@NgModule({
  imports: [
    StoreModule.forFeature(SEATMAPS_STATE, SEATMAPS_REDUCER_TOKEN),
    EffectsModule.forFeature([GetSeatmapsEffect]),
  ],
  providers: [{ provide: SEATMAPS_REDUCER_TOKEN, useFactory: getSeatmapsReducer }],
})
export class SeatmapsStoreModule {
  public static forRoot<T extends SeatmapsState>(
    reducerFactory: () => ActionReducer<T, Action>
  ): ModuleWithProviders<SeatmapsStoreModule> {
    return {
      ngModule: SeatmapsStoreModule,
      providers: [{ provide: SEATMAPS_REDUCER_TOKEN, useFactory: reducerFactory }],
    };
  }
}
