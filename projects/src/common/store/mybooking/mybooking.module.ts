import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';
import { myBookingReducer } from './mybooking.reducer';
import { MyBookingState, MY_BOOKING_STORE_NAME } from './mybooking.state';

/** Token of the MyBooking reducer */
export const MY_BOOKING_REDUCER_TOKEN = new InjectionToken<ActionReducer<MyBookingState, Action>>(
  'Feature MyBooking Reducer'
);

/** Provide default reducer for MyBooking store */
export function getDefaultMyBookingReducer() {
  return myBookingReducer;
}

@NgModule({
  imports: [StoreModule.forFeature(MY_BOOKING_STORE_NAME, MY_BOOKING_REDUCER_TOKEN)],
  providers: [{ provide: MY_BOOKING_REDUCER_TOKEN, useFactory: getDefaultMyBookingReducer }],
})
export class MyBookingStoreModule {
  public static forRoot<T extends MyBookingState>(
    reducerFactory: () => ActionReducer<T, Action>
  ): ModuleWithProviders<MyBookingStoreModule> {
    return {
      ngModule: MyBookingStoreModule,
      providers: [{ provide: MY_BOOKING_REDUCER_TOKEN, useFactory: reducerFactory }],
    };
  }
}
