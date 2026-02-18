import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { GetCreditPanInformationEffect } from './get-credit-pan-information.effect';
import { getCreditPanInformationReducer } from './get-credit-pan-information.reducer';
import {
  GET_CREDIT_PAN_INFORMATION_STORE_NAME,
  GetCreditPanInformationState,
} from './get-credit-pan-information.state';

/** Token of the GetCreditPanInformation reducer */
export const GET_CREDIT_PAN_INFORMATION_REDUCER_TOKEN = new InjectionToken<
  ActionReducer<GetCreditPanInformationState, Action>
>('Feature GetCreditPanInformation Reducer');

/** Provide default reducer for GetCreditPanInformation store */
export function getDefaultGetCreditPanInformationReducer() {
  return getCreditPanInformationReducer;
}

@NgModule({
  imports: [
    StoreModule.forFeature(GET_CREDIT_PAN_INFORMATION_STORE_NAME, GET_CREDIT_PAN_INFORMATION_REDUCER_TOKEN),
    EffectsModule.forFeature([GetCreditPanInformationEffect]),
  ],
  providers: [
    { provide: GET_CREDIT_PAN_INFORMATION_REDUCER_TOKEN, useFactory: getDefaultGetCreditPanInformationReducer },
  ],
})
export class GetCreditPanInformationStoreModule {
  public static forRoot<T extends GetCreditPanInformationState>(
    reducerFactory: () => ActionReducer<T, Action>
  ): ModuleWithProviders<GetCreditPanInformationStoreModule> {
    return {
      ngModule: GetCreditPanInformationStoreModule,
      providers: [{ provide: GET_CREDIT_PAN_INFORMATION_REDUCER_TOKEN, useFactory: reducerFactory }],
    };
  }
}
