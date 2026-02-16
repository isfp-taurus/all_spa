import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { deliverySearchInformationReducer } from './delivery-search-information.reducer';
import {
  DELIVERY_SEARCH_INFORMATION_STORE_NAME,
  DeliverySearchInformationState,
} from './delivery-search-information.state';

/** Token of the DeliverySearchInformation reducer */
export const DELIVERY_SEARCH_INFORMATION_REDUCER_TOKEN = new InjectionToken<
  ActionReducer<DeliverySearchInformationState, Action>
>('Feature DeliverySearchInformation Reducer');

/** Provide default reducer for DeliverySearchInformation store */
export function getDefaultDeliverySearchInformationReducer() {
  return deliverySearchInformationReducer;
}

@NgModule({
  imports: [StoreModule.forFeature(DELIVERY_SEARCH_INFORMATION_STORE_NAME, DELIVERY_SEARCH_INFORMATION_REDUCER_TOKEN)],
  providers: [
    { provide: DELIVERY_SEARCH_INFORMATION_REDUCER_TOKEN, useFactory: getDefaultDeliverySearchInformationReducer },
  ],
})
export class DeliverySearchInformationStoreModule {
  public static forRoot<T extends DeliverySearchInformationState>(
    reducerFactory: () => ActionReducer<T, Action>
  ): ModuleWithProviders<DeliverySearchInformationStoreModule> {
    return {
      ngModule: DeliverySearchInformationStoreModule,
      providers: [{ provide: DELIVERY_SEARCH_INFORMATION_REDUCER_TOKEN, useFactory: reducerFactory }],
    };
  }
}
