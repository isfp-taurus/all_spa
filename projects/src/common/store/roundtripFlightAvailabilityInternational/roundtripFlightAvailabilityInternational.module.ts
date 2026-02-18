import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';
import { roundtripFlightAvailabilityInternationalReducer } from './roundtripFlightAvailabilityInternational.reducer';
import {
  RoundtripFlightAvailabilityInternationalState,
  ROUNDTRIP_FLIGHT_AVAILABILITY_INTERNATIONAL_STORE_NAME,
} from './roundtripFlightAvailabilityInternational.state';

/** Token of the RoundtripFlightAvailabilityInternational reducer */
export const ROUNDTRIP_FLIGHT_AVAILABILITY_INTERNATIONAL_REDUCER_TOKEN = new InjectionToken<
  ActionReducer<RoundtripFlightAvailabilityInternationalState, Action>
>('Feature RoundtripFlightAvailabilityInternational Reducer');

/** Provide default reducer for RoundtripFlightAvailabilityInternational store */
export function getDefaultRoundtripFlightAvailabilityInternationalReducer() {
  return roundtripFlightAvailabilityInternationalReducer;
}

@NgModule({
  imports: [
    StoreModule.forFeature(
      ROUNDTRIP_FLIGHT_AVAILABILITY_INTERNATIONAL_STORE_NAME,
      ROUNDTRIP_FLIGHT_AVAILABILITY_INTERNATIONAL_REDUCER_TOKEN
    ),
  ],
  providers: [
    {
      provide: ROUNDTRIP_FLIGHT_AVAILABILITY_INTERNATIONAL_REDUCER_TOKEN,
      useFactory: getDefaultRoundtripFlightAvailabilityInternationalReducer,
    },
  ],
})
export class RoundtripFlightAvailabilityInternationalStoreModule {
  public static forRoot<T extends RoundtripFlightAvailabilityInternationalState>(
    reducerFactory: () => ActionReducer<T, Action>
  ): ModuleWithProviders<RoundtripFlightAvailabilityInternationalStoreModule> {
    return {
      ngModule: RoundtripFlightAvailabilityInternationalStoreModule,
      providers: [{ provide: ROUNDTRIP_FLIGHT_AVAILABILITY_INTERNATIONAL_REDUCER_TOKEN, useFactory: reducerFactory }],
    };
  }
}
