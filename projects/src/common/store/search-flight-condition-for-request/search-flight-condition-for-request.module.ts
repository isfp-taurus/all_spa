import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { SearchFlightConditionForRequestEffect } from './search-flight-condition-for-request.effect';
import { searchFlightConditionForRequestReducer } from './search-flight-condition-for-request.reducer';
import {
  SEARCH_FLIGHT_CONDITION_FOR_REQUEST_STORE_NAME,
  SearchFlightConditionForRequestState,
} from './search-flight-condition-for-request.state';

/** Token of the SearchFlightConditionForRequest reducer */
export const SEARCH_FLIGHT_CONDITION_FOR_REQUEST_REDUCER_TOKEN = new InjectionToken<
  ActionReducer<SearchFlightConditionForRequestState, Action>
>('Feature SearchFlightConditionForRequest Reducer');

/** Provide default reducer for SearchFlightConditionForRequest store */
export function getDefaultSearchFlightConditionForRequestReducer() {
  return searchFlightConditionForRequestReducer;
}

@NgModule({
  imports: [
    StoreModule.forFeature(
      SEARCH_FLIGHT_CONDITION_FOR_REQUEST_STORE_NAME,
      SEARCH_FLIGHT_CONDITION_FOR_REQUEST_REDUCER_TOKEN
    ),
    EffectsModule.forFeature([SearchFlightConditionForRequestEffect]),
  ],
  providers: [
    {
      provide: SEARCH_FLIGHT_CONDITION_FOR_REQUEST_REDUCER_TOKEN,
      useFactory: getDefaultSearchFlightConditionForRequestReducer,
    },
  ],
})
export class SearchFlightConditionForRequestStoreModule {
  public static forRoot<T extends SearchFlightConditionForRequestState>(
    reducerFactory: () => ActionReducer<T, Action>
  ): ModuleWithProviders<SearchFlightConditionForRequestStoreModule> {
    return {
      ngModule: SearchFlightConditionForRequestStoreModule,
      providers: [{ provide: SEARCH_FLIGHT_CONDITION_FOR_REQUEST_REDUCER_TOKEN, useFactory: reducerFactory }],
    };
  }
}
