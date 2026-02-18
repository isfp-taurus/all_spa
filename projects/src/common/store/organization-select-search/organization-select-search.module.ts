import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';
import { organizationSelectSearchReducer } from './organization-select-search.reducer';
import {
  ORGANIZATION_SELECT_SEARCH_STORE_NAME,
  OrganizationSelectSearchState,
} from './organization-select-search.state';

/** Token of the OrganizationSelectSearch reducer */
export const ORGANIZATION_SELECT_SEARCH_REDUCER_TOKEN = new InjectionToken<
  ActionReducer<OrganizationSelectSearchState, Action>
>('Feature OrganizationSelectSearch Reducer');

/** Provide default reducer for OrganizationSelectSearch store */
export function getDefaultOrganizationSelectSearchReducer() {
  return organizationSelectSearchReducer;
}

@NgModule({
  imports: [StoreModule.forFeature(ORGANIZATION_SELECT_SEARCH_STORE_NAME, ORGANIZATION_SELECT_SEARCH_REDUCER_TOKEN)],
  providers: [
    { provide: ORGANIZATION_SELECT_SEARCH_REDUCER_TOKEN, useFactory: getDefaultOrganizationSelectSearchReducer },
  ],
})
export class OrganizationSelectSearchStoreModule {
  public static forRoot<T extends OrganizationSelectSearchState>(
    reducerFactory: () => ActionReducer<T, Action>
  ): ModuleWithProviders<OrganizationSelectSearchStoreModule> {
    return {
      ngModule: OrganizationSelectSearchStoreModule,
      providers: [{ provide: ORGANIZATION_SELECT_SEARCH_REDUCER_TOKEN, useFactory: reducerFactory }],
    };
  }
}
