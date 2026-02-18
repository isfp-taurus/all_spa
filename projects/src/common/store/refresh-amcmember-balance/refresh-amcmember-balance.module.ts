import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { RefreshAmcmemberBalanceEffect } from './refresh-amcmember-balance.effect';
import { refreshAmcmemberBalanceReducer } from './refresh-amcmember-balance.reducer';
import { REFRESH_AMCMEMBER_BALANCE_STORE_NAME, RefreshAmcmemberBalanceState } from './refresh-amcmember-balance.state';

/** Token of the RefreshAmcmemberBalance reducer */
export const REFRESH_AMCMEMBER_BALANCE_REDUCER_TOKEN = new InjectionToken<
  ActionReducer<RefreshAmcmemberBalanceState, Action>
>('Feature RefreshAmcmemberBalance Reducer');

/** Provide default reducer for RefreshAmcmemberBalance store */
export function getDefaultRefreshAmcmemberBalanceReducer() {
  return refreshAmcmemberBalanceReducer;
}

@NgModule({
  imports: [
    StoreModule.forFeature(REFRESH_AMCMEMBER_BALANCE_STORE_NAME, REFRESH_AMCMEMBER_BALANCE_REDUCER_TOKEN),
    EffectsModule.forFeature([RefreshAmcmemberBalanceEffect]),
  ],
  providers: [
    { provide: REFRESH_AMCMEMBER_BALANCE_REDUCER_TOKEN, useFactory: getDefaultRefreshAmcmemberBalanceReducer },
  ],
})
export class RefreshAmcmemberBalanceStoreModule {
  public static forRoot<T extends RefreshAmcmemberBalanceState>(
    reducerFactory: () => ActionReducer<T, Action>
  ): ModuleWithProviders<RefreshAmcmemberBalanceStoreModule> {
    return {
      ngModule: RefreshAmcmemberBalanceStoreModule,
      providers: [{ provide: REFRESH_AMCMEMBER_BALANCE_REDUCER_TOKEN, useFactory: reducerFactory }],
    };
  }
}
