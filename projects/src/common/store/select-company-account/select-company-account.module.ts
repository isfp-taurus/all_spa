import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { SelectCompanyAccountEffect } from './select-company-account.effect';
import { selectCompanyAccountReducer } from './select-company-account.reducer';
import { SELECT_COMPANY_ACCOUNT_STORE_NAME, SelectCompanyAccountState } from './select-company-account.state';

/** Token of the SelectCompanyAccount reducer */
export const SELECT_COMPANY_ACCOUNT_REDUCER_TOKEN = new InjectionToken<
  ActionReducer<SelectCompanyAccountState, Action>
>('Feature SelectCompanyAccount Reducer');

/** Provide default reducer for SelectCompanyAccount store */
export function getDefaultSelectCompanyAccountReducer() {
  return selectCompanyAccountReducer;
}

@NgModule({
  imports: [
    StoreModule.forFeature(SELECT_COMPANY_ACCOUNT_STORE_NAME, SELECT_COMPANY_ACCOUNT_REDUCER_TOKEN),
    EffectsModule.forFeature([SelectCompanyAccountEffect]),
  ],
  providers: [{ provide: SELECT_COMPANY_ACCOUNT_REDUCER_TOKEN, useFactory: getDefaultSelectCompanyAccountReducer }],
})
export class SelectCompanyAccountStoreModule {
  public static forRoot<T extends SelectCompanyAccountState>(
    reducerFactory: () => ActionReducer<T, Action>
  ): ModuleWithProviders<SelectCompanyAccountStoreModule> {
    return {
      ngModule: SelectCompanyAccountStoreModule,
      providers: [{ provide: SELECT_COMPANY_ACCOUNT_REDUCER_TOKEN, useFactory: reducerFactory }],
    };
  }
}
