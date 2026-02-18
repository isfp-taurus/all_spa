import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';
import { FindMoreFlightsReducer } from './find-more-flights.reducer';
import { FIND_MORE_FLIGHTS_STORE_NAME, FindMoreFlightsState } from './find-more-flights.state';

/** Token of the FindMoreFlights reducer */
export const FIND_MORE_FLIGHTS_REDUCER_TOKEN = new InjectionToken<ActionReducer<FindMoreFlightsState, Action>>(
  'Feature FindMoreFlights Reducer'
);

/** Provide default reducer for FindMoreFlights store */
export function getDefaultFindMoreFlightsReducer() {
  return FindMoreFlightsReducer;
}

@NgModule({
  imports: [StoreModule.forFeature(FIND_MORE_FLIGHTS_STORE_NAME, FIND_MORE_FLIGHTS_REDUCER_TOKEN)],
  providers: [
    {
      provide: FIND_MORE_FLIGHTS_REDUCER_TOKEN,
      useFactory: getDefaultFindMoreFlightsReducer,
    },
  ],
})
export class FindMoreFlightsStoreModule {
  public static forRoot<T extends FindMoreFlightsState>(
    reducerFactory: () => ActionReducer<T, Action>
  ): ModuleWithProviders<FindMoreFlightsStoreModule> {
    return {
      ngModule: FindMoreFlightsStoreModule,
      providers: [{ provide: FIND_MORE_FLIGHTS_REDUCER_TOKEN, useFactory: reducerFactory }],
    };
  }
}
