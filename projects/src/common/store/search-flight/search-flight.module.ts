import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';
import { searchFlightReducer } from './search-flight.reducer';
import { SEARCH_FLIGHT_STORE_NAME, SearchFlightState } from './search-flight.state';

/** Token of the SearchFlight reducer */
export const SEARCH_FLIGHT_REDUCER_TOKEN = new InjectionToken<ActionReducer<SearchFlightState, Action>>(
  'Feature SearchFlight Reducer'
);

/** Provide default reducer for SearchFlight store */
export function getDefaultSearchFlightReducer() {
  return searchFlightReducer;
}

@NgModule({
  imports: [StoreModule.forFeature(SEARCH_FLIGHT_STORE_NAME, SEARCH_FLIGHT_REDUCER_TOKEN)],
  providers: [{ provide: SEARCH_FLIGHT_REDUCER_TOKEN, useFactory: getDefaultSearchFlightReducer }],
})
export class SearchFlightStoreModule {
  public static forRoot<T extends SearchFlightState>(
    reducerFactory: () => ActionReducer<T, Action>
  ): ModuleWithProviders<SearchFlightStoreModule> {
    return {
      ngModule: SearchFlightStoreModule,
      providers: [{ provide: SEARCH_FLIGHT_REDUCER_TOKEN, useFactory: reducerFactory }],
    };
  }
}
