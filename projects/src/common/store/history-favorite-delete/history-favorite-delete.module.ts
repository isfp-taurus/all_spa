import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { HistoryFavoriteDeleteEffect } from './history-favorite-delete.effect';
import { historyFavoriteDeleteReducer } from './history-favorite-delete.reducer';
import { HISTORY_FAVORITE_DELETE_STORE_NAME, HistoryFavoriteDeleteState } from './history-favorite-delete.state';

/** Token of the HistoryFavoriteDelete reducer */
export const HISTORY_FAVORITE_DELETE_REDUCER_TOKEN = new InjectionToken<
  ActionReducer<HistoryFavoriteDeleteState, Action>
>('Feature HistoryFavoriteDelete Reducer');

/** Provide default reducer for HistoryFavoriteDelete store */
export function getDefaultHistoryFavoriteDeleteReducer() {
  return historyFavoriteDeleteReducer;
}

@NgModule({
  imports: [
    StoreModule.forFeature(HISTORY_FAVORITE_DELETE_STORE_NAME, HISTORY_FAVORITE_DELETE_REDUCER_TOKEN),
    EffectsModule.forFeature([HistoryFavoriteDeleteEffect]),
  ],
  providers: [{ provide: HISTORY_FAVORITE_DELETE_REDUCER_TOKEN, useFactory: getDefaultHistoryFavoriteDeleteReducer }],
})
export class HistoryFavoriteDeleteStoreModule {
  public static forRoot<T extends HistoryFavoriteDeleteState>(
    reducerFactory: () => ActionReducer<T, Action>
  ): ModuleWithProviders<HistoryFavoriteDeleteStoreModule> {
    return {
      ngModule: HistoryFavoriteDeleteStoreModule,
      providers: [{ provide: HISTORY_FAVORITE_DELETE_REDUCER_TOKEN, useFactory: reducerFactory }],
    };
  }
}
