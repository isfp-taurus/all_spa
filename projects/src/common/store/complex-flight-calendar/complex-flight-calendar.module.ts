import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';
import { ComplexFlightCalendarReducer } from './complex-flight-calendar.reducer';
import { COMPLEX_FLIGHT_CALENDAR_STORE_NAME, ComplexFlightCalendarState } from './complex-flight-calendar.state';

/** Token of the ComplexFlightCalendar reducer */
export const COMPLEX_FLIGHT_CALENDAR_REDUCER_TOKEN = new InjectionToken<
  ActionReducer<ComplexFlightCalendarState, Action>
>('Feature ComplexFlightCalendar Reducer');

/** Provide default reducer for ComplexFlightCalendar store */
export function getDefaultComplexFlightCalendarReducer() {
  return ComplexFlightCalendarReducer;
}

@NgModule({
  imports: [StoreModule.forFeature(COMPLEX_FLIGHT_CALENDAR_STORE_NAME, COMPLEX_FLIGHT_CALENDAR_REDUCER_TOKEN)],
  providers: [
    {
      provide: COMPLEX_FLIGHT_CALENDAR_REDUCER_TOKEN,
      useFactory: getDefaultComplexFlightCalendarReducer,
    },
  ],
})
export class ComplexFlightCalendarStoreModule {
  public static forRoot<T extends ComplexFlightCalendarState>(
    reducerFactory: () => ActionReducer<T, Action>
  ): ModuleWithProviders<ComplexFlightCalendarStoreModule> {
    return {
      ngModule: ComplexFlightCalendarStoreModule,
      providers: [{ provide: COMPLEX_FLIGHT_CALENDAR_REDUCER_TOKEN, useFactory: reducerFactory }],
    };
  }
}
