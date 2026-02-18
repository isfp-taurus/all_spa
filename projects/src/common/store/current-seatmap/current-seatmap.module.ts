import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';
import { currentSeatmapReducer } from './current-seatmap.reducer';
import { CURRENT_SEATMAP_STORE_NAME, CurrentSeatmapState } from './current-seatmap.state';

/** Token of the CurrentSeatmap reducer */
export const CURRENT_SEATMAP_REDUCER_TOKEN = new InjectionToken<ActionReducer<CurrentSeatmapState, Action>>(
  'Feature CurrentSeatmap Reducer'
);

/** Provide default reducer for CurrentSeatmap store */
export function getDefaultCurrentSeatmapReducer() {
  return currentSeatmapReducer;
}

@NgModule({
  imports: [StoreModule.forFeature(CURRENT_SEATMAP_STORE_NAME, CURRENT_SEATMAP_REDUCER_TOKEN)],
  providers: [{ provide: CURRENT_SEATMAP_REDUCER_TOKEN, useFactory: getDefaultCurrentSeatmapReducer }],
})
export class CurrentSeatmapStoreModule {
  public static forRoot<T extends CurrentSeatmapState>(
    reducerFactory: () => ActionReducer<T, Action>
  ): ModuleWithProviders<CurrentSeatmapStoreModule> {
    return {
      ngModule: CurrentSeatmapStoreModule,
      providers: [{ provide: CURRENT_SEATMAP_REDUCER_TOKEN, useFactory: reducerFactory }],
    };
  }
}
