import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';
import { ComplexFlightAvailabilityReducer } from './complex-flight-availability.reducer';
import {
  COMPLEX_FLIGHT_AVAILABILITY_STORE_NAME,
  ComplexFlightAvailabilityState,
} from './complex-flight-availability.state';

/** Token of the ComplexFlightAvailability reducer */
export const COMPLEX_FLIGHT_AVAILABILITY_REDUCER_TOKEN = new InjectionToken<
  ActionReducer<ComplexFlightAvailabilityState, Action>
>('Feature ComplexFlightAvailability Reducer');

/** Provide default reducer for ComplexFlightAvailability store */
export function getDefaultComplexFlightAvailabilityReducer() {
  return ComplexFlightAvailabilityReducer;
}

@NgModule({
  imports: [StoreModule.forFeature(COMPLEX_FLIGHT_AVAILABILITY_STORE_NAME, COMPLEX_FLIGHT_AVAILABILITY_REDUCER_TOKEN)],
  providers: [
    {
      provide: COMPLEX_FLIGHT_AVAILABILITY_REDUCER_TOKEN,
      useFactory: getDefaultComplexFlightAvailabilityReducer,
    },
  ],
})
export class ComplexFlightAvailabilityStoreModule {
  public static forRoot<T extends ComplexFlightAvailabilityState>(
    reducerFactory: () => ActionReducer<T, Action>
  ): ModuleWithProviders<ComplexFlightAvailabilityStoreModule> {
    return {
      ngModule: ComplexFlightAvailabilityStoreModule,
      providers: [{ provide: COMPLEX_FLIGHT_AVAILABILITY_REDUCER_TOKEN, useFactory: reducerFactory }],
    };
  }
}
