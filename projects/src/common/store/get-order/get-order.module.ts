import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { GetOrderEffect } from './get-order.effect';
import { getOrderReducer } from './get-order.reducer';
import { GET_ORDER_STORE_NAME, GetOrderState } from './get-order.state';

/** Token of the GetOrder reducer */
export const GET_ORDER_REDUCER_TOKEN = new InjectionToken<ActionReducer<GetOrderState, Action>>(
  'Feature GetOrder Reducer'
);

/** Provide default reducer for GetOrder store */
export function getDefaultGetOrderReducer() {
  return getOrderReducer;
}

@NgModule({
  imports: [
    StoreModule.forFeature(GET_ORDER_STORE_NAME, GET_ORDER_REDUCER_TOKEN),
    EffectsModule.forFeature([GetOrderEffect]),
  ],
  providers: [{ provide: GET_ORDER_REDUCER_TOKEN, useFactory: getDefaultGetOrderReducer }],
})
export class GetOrderStoreModule {
  public static forRoot<T extends GetOrderState>(
    reducerFactory: () => ActionReducer<T, Action>
  ): ModuleWithProviders<GetOrderStoreModule> {
    return {
      ngModule: GetOrderStoreModule,
      providers: [{ provide: GET_ORDER_REDUCER_TOKEN, useFactory: reducerFactory }],
    };
  }
}
