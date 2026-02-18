import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';
import { searchFlightHistoryModalReducer } from './search-flight-history-modal.reducer';
import {
  SEARCH_FLIGHT_HISTORY_MODAL_STORE_NAME,
  SearchFlightHistoryModalState,
} from './search-flight-history-modal.state';

/** Token of the SearchFlightHistoryModal reducer */
export const SEARCH_FLIGHT_HISTORY_MODAL_REDUCER_TOKEN = new InjectionToken<
  ActionReducer<SearchFlightHistoryModalState, Action>
>('Feature SearchFlightHistoryModal Reducer');

/** Provide default reducer for SearchFlightHistoryModal store */
export function getDefaultSearchFlightHistoryModalReducer() {
  return searchFlightHistoryModalReducer;
}

@NgModule({
  imports: [StoreModule.forFeature(SEARCH_FLIGHT_HISTORY_MODAL_STORE_NAME, SEARCH_FLIGHT_HISTORY_MODAL_REDUCER_TOKEN)],
  providers: [
    { provide: SEARCH_FLIGHT_HISTORY_MODAL_REDUCER_TOKEN, useFactory: getDefaultSearchFlightHistoryModalReducer },
  ],
})
export class SearchFlightHistoryModalStoreModule {
  public static forRoot<T extends SearchFlightHistoryModalState>(
    reducerFactory: () => ActionReducer<T, Action>
  ): ModuleWithProviders<SearchFlightHistoryModalStoreModule> {
    return {
      ngModule: SearchFlightHistoryModalStoreModule,
      providers: [{ provide: SEARCH_FLIGHT_HISTORY_MODAL_REDUCER_TOKEN, useFactory: reducerFactory }],
    };
  }
}
