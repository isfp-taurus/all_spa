import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { HistoryEffect } from './history.effect';
import { historyReducer } from './history.reducer';
import { HISTORY_STORE_NAME, HistoryState } from './history.state';

/** Token of the History reducer */
export const HISTORY_REDUCER_TOKEN = new InjectionToken<ActionReducer<HistoryState, Action>>('Feature History Reducer');

/** Provide default reducer for History store */
export function getDefaultHistoryReducer() {
  return historyReducer;
}

@NgModule({
  imports: [
    StoreModule.forFeature(HISTORY_STORE_NAME, HISTORY_REDUCER_TOKEN),
    EffectsModule.forFeature([HistoryEffect]),
  ],
  providers: [{ provide: HISTORY_REDUCER_TOKEN, useFactory: getDefaultHistoryReducer }],
})
export class HistoryStoreModule {
  public static forRoot<T extends HistoryState>(
    reducerFactory: () => ActionReducer<T, Action>
  ): ModuleWithProviders<HistoryStoreModule> {
    return {
      ngModule: HistoryStoreModule,
      providers: [{ provide: HISTORY_REDUCER_TOKEN, useFactory: reducerFactory }],
    };
  }
}
