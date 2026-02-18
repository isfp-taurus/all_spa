import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { HistoryFavoriteGetEffect } from './history-favorite-get.effect';
import { historyFavoriteGetReducer } from './history-favorite-get.reducer';
import { HISTORY_FAVORITE_GET_STORE_NAME, HistoryFavoriteGetState } from './history-favorite-get.state';

/** Token of the HistoryFavoriteGet reducer */
export const HISTORY_FAVORITE_GET_REDUCER_TOKEN = new InjectionToken<ActionReducer<HistoryFavoriteGetState, Action>>(
  'Feature HistoryFavoriteGet Reducer'
);

/** Provide default reducer for HistoryFavoriteGet store */
export function getDefaultHistoryFavoriteGetReducer() {
  return historyFavoriteGetReducer;
}

@NgModule({
  imports: [
    StoreModule.forFeature(HISTORY_FAVORITE_GET_STORE_NAME, HISTORY_FAVORITE_GET_REDUCER_TOKEN),
    EffectsModule.forFeature([HistoryFavoriteGetEffect]),
  ],
  providers: [{ provide: HISTORY_FAVORITE_GET_REDUCER_TOKEN, useFactory: getDefaultHistoryFavoriteGetReducer }],
})
export class HistoryFavoriteGetStoreModule {
  public static forRoot<T extends HistoryFavoriteGetState>(
    reducerFactory: () => ActionReducer<T, Action>
  ): ModuleWithProviders<HistoryFavoriteGetStoreModule> {
    return {
      ngModule: HistoryFavoriteGetStoreModule,
      providers: [{ provide: HISTORY_FAVORITE_GET_REDUCER_TOKEN, useFactory: reducerFactory }],
    };
  }
}
