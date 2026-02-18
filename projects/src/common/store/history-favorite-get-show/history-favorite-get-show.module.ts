import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { HistoryFavoriteGetShowEffect } from './history-favorite-get-show.effect';
import { historyFavoriteGetShowReducer } from './history-favorite-get-show.reducer';
import { HISTORY_FAVORITE_GET_SHOW_STORE_NAME, HistoryFavoriteGetShowState } from './history-favorite-get-show.state';

/** Token of the HistoryFavoriteGetShow reducer */
export const HISTORY_FAVORITE_GET_SHOW_REDUCER_TOKEN = new InjectionToken<
  ActionReducer<HistoryFavoriteGetShowState, Action>
>('Feature HistoryFavoriteGetShow Reducer');

/** Provide default reducer for HistoryFavoriteGetShow store */
export function getDefaultHistoryFavoriteGetShowReducer() {
  return historyFavoriteGetShowReducer;
}

@NgModule({
  imports: [
    StoreModule.forFeature(HISTORY_FAVORITE_GET_SHOW_STORE_NAME, HISTORY_FAVORITE_GET_SHOW_REDUCER_TOKEN),
    EffectsModule.forFeature([HistoryFavoriteGetShowEffect]),
  ],
  providers: [
    { provide: HISTORY_FAVORITE_GET_SHOW_REDUCER_TOKEN, useFactory: getDefaultHistoryFavoriteGetShowReducer },
  ],
})
export class HistoryFavoriteGetShowStoreModule {
  public static forRoot<T extends HistoryFavoriteGetShowState>(
    reducerFactory: () => ActionReducer<T, Action>
  ): ModuleWithProviders<HistoryFavoriteGetShowStoreModule> {
    return {
      ngModule: HistoryFavoriteGetShowStoreModule,
      providers: [{ provide: HISTORY_FAVORITE_GET_SHOW_REDUCER_TOKEN, useFactory: reducerFactory }],
    };
  }
}
