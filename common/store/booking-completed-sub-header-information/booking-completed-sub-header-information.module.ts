import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';
import { bookingCompletedSubHeaderInformationReducer } from './booking-completed-sub-header-information.reducer';
import {
  BOOKING_COMPLETED_SUB_HEADER_INFORMATION_STORE_NAME,
  BookingCompletedSubHeaderInformationState,
} from './booking-completed-sub-header-information.state';

/** Token of the BookingCompletedSubHeaderInformation reducer */
export const SUB_HEADER_INFORMATION_REDUCER_TOKEN = new InjectionToken<
  ActionReducer<BookingCompletedSubHeaderInformationState, Action>
>('Feature BookingCompletedSubHeaderInformation Reducer');

/** Provide default reducer for BookingCompletedSubHeaderInformation store */
export function getDefaultBookingCompletedSubHeaderInformationReducer() {
  return bookingCompletedSubHeaderInformationReducer;
}

@NgModule({
  imports: [
    StoreModule.forFeature(BOOKING_COMPLETED_SUB_HEADER_INFORMATION_STORE_NAME, SUB_HEADER_INFORMATION_REDUCER_TOKEN),
  ],
  providers: [
    {
      provide: SUB_HEADER_INFORMATION_REDUCER_TOKEN,
      useFactory: getDefaultBookingCompletedSubHeaderInformationReducer,
    },
  ],
})
export class BookingCompletedSubHeaderInformationStoreModule {
  public static forRoot<T extends BookingCompletedSubHeaderInformationState>(
    reducerFactory: () => ActionReducer<T, Action>
  ): ModuleWithProviders<BookingCompletedSubHeaderInformationStoreModule> {
    return {
      ngModule: BookingCompletedSubHeaderInformationStoreModule,
      providers: [{ provide: SUB_HEADER_INFORMATION_REDUCER_TOKEN, useFactory: reducerFactory }],
    };
  }
}
