import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { notEligibleInformationReducer } from './not-eligible-information.reducer';
import { NOT_ELIGIBLE_INFORMATION_STORE_NAME, NotEligibleInformationState } from './not-eligible-information.state';

/** Token of the NotEligibleInformation reducer */
export const NOT_ELIGIBLE_INFORMATION_REDUCER_TOKEN = new InjectionToken<
  ActionReducer<NotEligibleInformationState, Action>
>('Feature NotEligibleInformation Reducer');

/** Provide default reducer for NotEligibleInformation store */
export function getDefaultNotEligibleInformationReducer() {
  return notEligibleInformationReducer;
}

@NgModule({
  imports: [StoreModule.forFeature(NOT_ELIGIBLE_INFORMATION_STORE_NAME, NOT_ELIGIBLE_INFORMATION_REDUCER_TOKEN)],
  providers: [{ provide: NOT_ELIGIBLE_INFORMATION_REDUCER_TOKEN, useFactory: getDefaultNotEligibleInformationReducer }],
})
export class NotEligibleInformationStoreModule {
  public static forRoot<T extends NotEligibleInformationState>(
    reducerFactory: () => ActionReducer<T, Action>
  ): ModuleWithProviders<NotEligibleInformationStoreModule> {
    return {
      ngModule: NotEligibleInformationStoreModule,
      providers: [{ provide: NOT_ELIGIBLE_INFORMATION_REDUCER_TOKEN, useFactory: reducerFactory }],
    };
  }
}
