import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { OrdersRepriceOrderEffect } from './orders-reprice-order.effect';
import { ordersRepriceOrderReducer } from './orders-reprice-order.reducer';
import { ORDERS_REPRICE_ORDER_STORE_NAME, OrdersRepriceOrderState } from './orders-reprice-order.state';

/** Token of the OrdersRepriceOrder reducer */
export const ORDERS_REPRICE_ORDER_REDUCER_TOKEN = new InjectionToken<ActionReducer<OrdersRepriceOrderState, Action>>(
  'Feature OrdersRepriceOrder Reducer'
);

/** Provide default reducer for OrdersRepriceOrder store */
export function getDefaultOrdersRepriceOrderReducer() {
  return ordersRepriceOrderReducer;
}

@NgModule({
  imports: [
    StoreModule.forFeature(ORDERS_REPRICE_ORDER_STORE_NAME, ORDERS_REPRICE_ORDER_REDUCER_TOKEN),
    EffectsModule.forFeature([OrdersRepriceOrderEffect]),
  ],
  providers: [{ provide: ORDERS_REPRICE_ORDER_REDUCER_TOKEN, useFactory: getDefaultOrdersRepriceOrderReducer }],
})
export class OrdersRepriceOrderStoreModule {
  public static forRoot<T extends OrdersRepriceOrderState>(
    reducerFactory: () => ActionReducer<T, Action>
  ): ModuleWithProviders<OrdersRepriceOrderStoreModule> {
    return {
      ngModule: OrdersRepriceOrderStoreModule,
      providers: [{ provide: ORDERS_REPRICE_ORDER_REDUCER_TOKEN, useFactory: reducerFactory }],
    };
  }
}
