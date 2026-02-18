import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';
import { dynamicContentReducer } from './dynamic-content.reducer';
import { DYNAMIC_CONTENT_STORE_NAME, DynamicContentState } from './dynamic-content.state';

/** Token of the DynamicContent reducer */
export const DYNAMIC_CONTENT_REDUCER_TOKEN = new InjectionToken<ActionReducer<DynamicContentState, Action>>(
  'Feature DynamicContent Reducer'
);

/** Provide default reducer for DynamicContent store */
export function getDefaultDynamicContentReducer() {
  return dynamicContentReducer;
}

@NgModule({
  imports: [StoreModule.forFeature(DYNAMIC_CONTENT_STORE_NAME, DYNAMIC_CONTENT_REDUCER_TOKEN)],
  providers: [{ provide: DYNAMIC_CONTENT_REDUCER_TOKEN, useFactory: getDefaultDynamicContentReducer }],
})
export class DynamicContentStoreModule {
  public static forRoot<T extends DynamicContentState>(
    reducerFactory: () => ActionReducer<T, Action>
  ): ModuleWithProviders<DynamicContentStoreModule> {
    return {
      ngModule: DynamicContentStoreModule,
      providers: [{ provide: DYNAMIC_CONTENT_REDUCER_TOKEN, useFactory: reducerFactory }],
    };
  }
}
