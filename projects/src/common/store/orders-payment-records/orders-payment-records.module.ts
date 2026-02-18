import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { OrdersPaymentRecordsEffect } from './orders-payment-records.effect';
import { ordersPaymentRecordsReducer } from './orders-payment-records.reducer';
import { ORDERS_PAYMENT_RECORDS_STORE_NAME, OrdersPaymentRecordsState } from './orders-payment-records.state';

/** Token of the OrdersPaymentRecords reducer */
export const ORDERS_PAYMENT_RECORDS_REDUCER_TOKEN = new InjectionToken<
  ActionReducer<OrdersPaymentRecordsState, Action>
>('Feature OrdersPaymentRecords Reducer');

/** Provide default reducer for OrdersPaymentRecords store */
export function getDefaultOrdersPaymentRecordsReducer() {
  return ordersPaymentRecordsReducer;
}

@NgModule({
  imports: [
    StoreModule.forFeature(ORDERS_PAYMENT_RECORDS_STORE_NAME, ORDERS_PAYMENT_RECORDS_REDUCER_TOKEN),
    EffectsModule.forFeature([OrdersPaymentRecordsEffect]),
  ],
  providers: [{ provide: ORDERS_PAYMENT_RECORDS_REDUCER_TOKEN, useFactory: getDefaultOrdersPaymentRecordsReducer }],
})
export class OrdersPaymentRecordsStoreModule {
  public static forRoot<T extends OrdersPaymentRecordsState>(
    reducerFactory: () => ActionReducer<T, Action>
  ): ModuleWithProviders<OrdersPaymentRecordsStoreModule> {
    return {
      ngModule: OrdersPaymentRecordsStoreModule,
      providers: [{ provide: ORDERS_PAYMENT_RECORDS_REDUCER_TOKEN, useFactory: reducerFactory }],
    };
  }
}
