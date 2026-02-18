import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { OrdersReservationAvailabilityEffect } from './orders-reservation-availability.effect';
import { ordersReservationAvailabilityReducer } from './orders-reservation-availability.reducer';
import {
  ORDERS_RESERVATION_AVAILABILITY_STORE_NAME,
  OrdersReservationAvailabilityState,
} from './orders-reservation-availability.state';

/** Token of the OrdersReservationAvailability reducer */
export const ORDERS_RESERVATION_AVAILABILITY_REDUCER_TOKEN = new InjectionToken<
  ActionReducer<OrdersReservationAvailabilityState, Action>
>('Feature OrdersReservationAvailability Reducer');

/** Provide default reducer for OrdersReservationAvailability store */
export function getDefaultOrdersReservationAvailabilityReducer() {
  return ordersReservationAvailabilityReducer;
}

@NgModule({
  imports: [
    StoreModule.forFeature(ORDERS_RESERVATION_AVAILABILITY_STORE_NAME, ORDERS_RESERVATION_AVAILABILITY_REDUCER_TOKEN),
    EffectsModule.forFeature([OrdersReservationAvailabilityEffect]),
  ],
  providers: [
    {
      provide: ORDERS_RESERVATION_AVAILABILITY_REDUCER_TOKEN,
      useFactory: getDefaultOrdersReservationAvailabilityReducer,
    },
  ],
})
export class OrdersReservationAvailabilityStoreModule {
  public static forRoot<T extends OrdersReservationAvailabilityState>(
    reducerFactory: () => ActionReducer<T, Action>
  ): ModuleWithProviders<OrdersReservationAvailabilityStoreModule> {
    return {
      ngModule: OrdersReservationAvailabilityStoreModule,
      providers: [{ provide: ORDERS_RESERVATION_AVAILABILITY_REDUCER_TOKEN, useFactory: reducerFactory }],
    };
  }
}
