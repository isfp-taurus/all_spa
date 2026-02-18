import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';
import { SearchFlightHistoryReducer } from './search-flight-history.reducer';
import { SEARCH_FLIGHT_HISTORY_STORE_NAME, SearchFlightHistoryState } from './search-flight-history.state';

/** Token of the SearchFlightHistory reducer */
export const SEARCH_FLIGHT_HISTORY_REDUCER_TOKEN = new InjectionToken<ActionReducer<SearchFlightHistoryState, Action>>(
  'Feature SearchFlightHistory Reducer'
);

/** Provide default reducer for SearchFlightHistory store */
export function getDefaultSearchFlightHistoryReducer() {
  return SearchFlightHistoryReducer;
}

@NgModule({
  imports: [StoreModule.forFeature(SEARCH_FLIGHT_HISTORY_STORE_NAME, SEARCH_FLIGHT_HISTORY_REDUCER_TOKEN)],
  providers: [{ provide: SEARCH_FLIGHT_HISTORY_REDUCER_TOKEN, useFactory: getDefaultSearchFlightHistoryReducer }],
})
export class SearchFlightHistoryStoreModule {
  public static forRoot<T extends SearchFlightHistoryState>(
    reducerFactory: () => ActionReducer<T, Action>
  ): ModuleWithProviders<SearchFlightHistoryStoreModule> {
    return {
      ngModule: SearchFlightHistoryStoreModule,
      providers: [{ provide: SEARCH_FLIGHT_HISTORY_REDUCER_TOKEN, useFactory: reducerFactory }],
    };
  }
}
