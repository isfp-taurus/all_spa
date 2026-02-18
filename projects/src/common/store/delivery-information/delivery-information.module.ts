import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { deliveryInformationReducer } from './delivery-information.reducer';
import { DELIVERY_INFORMATION_STORE_NAME, DeliveryInformationState } from './delivery-information.state';

/** Token of the DeliveryInformation reducer */
export const DELIVERY_INFORMATION_REDUCER_TOKEN = new InjectionToken<ActionReducer<DeliveryInformationState, Action>>(
  'Feature DeliveryInformation Reducer'
);

/** Provide default reducer for DeliveryInformation store */
export function getDefaultDeliveryInformationReducer() {
  return deliveryInformationReducer;
}

@NgModule({
  imports: [StoreModule.forFeature(DELIVERY_INFORMATION_STORE_NAME, DELIVERY_INFORMATION_REDUCER_TOKEN)],
  providers: [{ provide: DELIVERY_INFORMATION_REDUCER_TOKEN, useFactory: getDefaultDeliveryInformationReducer }],
})
export class DeliveryInformationStoreModule {
  public static forRoot<T extends DeliveryInformationState>(
    reducerFactory: () => ActionReducer<T, Action>
  ): ModuleWithProviders<DeliveryInformationStoreModule> {
    return {
      ngModule: DeliveryInformationStoreModule,
      providers: [{ provide: DELIVERY_INFORMATION_REDUCER_TOKEN, useFactory: reducerFactory }],
    };
  }
}
