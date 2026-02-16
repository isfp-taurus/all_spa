import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';
import { GetCompanyAccountsEffect } from './get-company-accounts.effect';
import { getCompanyAccountsReducer } from './get-company-accounts.reducer';
import { GET_COMPANY_ACCOUNTS_STORE_NAME, GetCompanyAccountsState } from './get-company-accounts.state';

/** Token of the GetCompanyAccounts reducer */
export const GET_COMPANY_ACCOUNTS_REDUCER_TOKEN = new InjectionToken<ActionReducer<GetCompanyAccountsState, Action>>(
  'Feature GetCompanyAccounts Reducer'
);

/** Provide default reducer for GetCompanyAccounts store */
export function getDefaultGetCompanyAccountsReducer() {
  return getCompanyAccountsReducer;
}

@NgModule({
  imports: [
    StoreModule.forFeature(GET_COMPANY_ACCOUNTS_STORE_NAME, GET_COMPANY_ACCOUNTS_REDUCER_TOKEN),
    EffectsModule.forFeature([GetCompanyAccountsEffect]),
  ],
  providers: [{ provide: GET_COMPANY_ACCOUNTS_REDUCER_TOKEN, useFactory: getDefaultGetCompanyAccountsReducer }],
})
export class GetCompanyAccountsStoreModule {
  public static forRoot<T extends GetCompanyAccountsState>(
    reducerFactory: () => ActionReducer<T, Action>
  ): ModuleWithProviders<GetCompanyAccountsStoreModule> {
    return {
      ngModule: GetCompanyAccountsStoreModule,
      providers: [{ provide: GET_COMPANY_ACCOUNTS_REDUCER_TOKEN, useFactory: reducerFactory }],
    };
  }
}
