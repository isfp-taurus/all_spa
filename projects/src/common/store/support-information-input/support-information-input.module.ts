import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';
import { supportInformationInputReducer } from './support-information-input.reducer';
import { SUPPORT_INFORMATION_INPUT_STORE_NAME, SupportInformationInputState } from './support-information-input.state';

/** Token of the SupportInformationInput reducer */
export const SUPPORT_INFORMATION_INPUT_REDUCER_TOKEN = new InjectionToken<
  ActionReducer<SupportInformationInputState, Action>
>('Feature SupportInformationInput Reducer');

/** Provide default reducer for SupportInformationInput store */
export function getDefaultSupportInformationInputReducer() {
  return supportInformationInputReducer;
}

@NgModule({
  imports: [StoreModule.forFeature(SUPPORT_INFORMATION_INPUT_STORE_NAME, SUPPORT_INFORMATION_INPUT_REDUCER_TOKEN)],
  providers: [
    { provide: SUPPORT_INFORMATION_INPUT_REDUCER_TOKEN, useFactory: getDefaultSupportInformationInputReducer },
  ],
})
export class SupportInformationInputStoreModule {
  public static forRoot<T extends SupportInformationInputState>(
    reducerFactory: () => ActionReducer<T, Action>
  ): ModuleWithProviders<SupportInformationInputStoreModule> {
    return {
      ngModule: SupportInformationInputStoreModule,
      providers: [{ provide: SUPPORT_INFORMATION_INPUT_REDUCER_TOKEN, useFactory: reducerFactory }],
    };
  }
}
