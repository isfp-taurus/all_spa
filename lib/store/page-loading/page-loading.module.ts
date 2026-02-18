import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';
import { pageLoadingReducer } from './page-loading.reducer';
import { PAGE_INIT_STORE_NAME, PageLoadingState } from './page-loading.state';

/** Token of the PageLoading reducer */
export const PAGE_INIT_REDUCER_TOKEN = new InjectionToken<ActionReducer<PageLoadingState, Action>>(
  'Feature PageLoading Reducer'
);

/** Provide default reducer for PageLoading store */
export function getDefaultPageLoadingReducer() {
  return pageLoadingReducer;
}

@NgModule({
  imports: [StoreModule.forFeature(PAGE_INIT_STORE_NAME, PAGE_INIT_REDUCER_TOKEN)],
  providers: [{ provide: PAGE_INIT_REDUCER_TOKEN, useFactory: getDefaultPageLoadingReducer }],
})
export class PageLoadingStoreModule {
  public static forRoot<T extends PageLoadingState>(
    reducerFactory: () => ActionReducer<T, Action>
  ): ModuleWithProviders<PageLoadingStoreModule> {
    return {
      ngModule: PageLoadingStoreModule,
      providers: [{ provide: PAGE_INIT_REDUCER_TOKEN, useFactory: reducerFactory }],
    };
  }
}
