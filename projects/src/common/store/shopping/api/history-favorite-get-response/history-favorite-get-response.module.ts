import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { HistoryFavoriteGetResponseEffect } from './history-favorite-get-response.effect';
import { historyFavoriteGetResponseReducer } from './history-favorite-get-response.reducer';
import {
  HISTORY_FAVORITE_GET_RESPONSE_STORE_NAME,
  HistoryFavoriteGetResponseState,
} from './history-favorite-get-response.state';

/** Token of the HistoryFavoriteGetResponse reducer */
export const HISTORY_FAVORITE_GET_RESPONSE_REDUCER_TOKEN = new InjectionToken<
  ActionReducer<HistoryFavoriteGetResponseState, Action>
>('Feature HistoryFavoriteGetResponse Reducer');

/** Provide default reducer for HistoryFavoriteGetResponse store */
export function getDefaultHistoryFavoriteGetResponseReducer() {
  return historyFavoriteGetResponseReducer;
}

@NgModule({
  imports: [
    StoreModule.forFeature(HISTORY_FAVORITE_GET_RESPONSE_STORE_NAME, HISTORY_FAVORITE_GET_RESPONSE_REDUCER_TOKEN),
    EffectsModule.forFeature([HistoryFavoriteGetResponseEffect]),
  ],
  providers: [
    { provide: HISTORY_FAVORITE_GET_RESPONSE_REDUCER_TOKEN, useFactory: getDefaultHistoryFavoriteGetResponseReducer },
  ],
})
export class HistoryFavoriteGetResponseStoreModule {
  public static forRoot<T extends HistoryFavoriteGetResponseState>(
    reducerFactory: () => ActionReducer<T, Action>
  ): ModuleWithProviders<HistoryFavoriteGetResponseStoreModule> {
    return {
      ngModule: HistoryFavoriteGetResponseStoreModule,
      providers: [{ provide: HISTORY_FAVORITE_GET_RESPONSE_REDUCER_TOKEN, useFactory: reducerFactory }],
    };
  }
}
