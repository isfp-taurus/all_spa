import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';
import { confidentialReducer } from './confidential.reducer';
import { CONFIDENTIAL_STORE_NAME, ConfidentialState } from './confidential.state';

/** Token of the Confidential reducer */
export const CONFIDENTIAL_REDUCER_TOKEN = new InjectionToken<ActionReducer<ConfidentialState, Action>>(
  'Feature Confidential Reducer'
);

/** Provide default reducer for Confidential store */
export function getDefaultConfidentialReducer() {
  return confidentialReducer;
}

@NgModule({
  imports: [StoreModule.forFeature(CONFIDENTIAL_STORE_NAME, CONFIDENTIAL_REDUCER_TOKEN)],
  providers: [{ provide: CONFIDENTIAL_REDUCER_TOKEN, useFactory: getDefaultConfidentialReducer }],
})
export class ConfidentialStoreModule {
  public static forRoot<T extends ConfidentialState>(
    reducerFactory: () => ActionReducer<T, Action>
  ): ModuleWithProviders<ConfidentialStoreModule> {
    return {
      ngModule: ConfidentialStoreModule,
      providers: [{ provide: CONFIDENTIAL_REDUCER_TOKEN, useFactory: reducerFactory }],
    };
  }
}
