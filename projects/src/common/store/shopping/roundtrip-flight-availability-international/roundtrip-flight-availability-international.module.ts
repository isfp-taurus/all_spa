import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';
import { RoundtripFlightAvailabilityInternationalEffect } from './roundtrip-flight-availability-international.effect';
import { roundtripFlightAvailabilityInternationalReducer } from './roundtrip-flight-availability-international.reducer';
import {
  ROUNDTRIP_FLIGHT_AVAILABILITY_INTERNATIONAL_STORE_NAME,
  RoundtripFlightAvailabilityInternationalModel,
} from './roundtrip-flight-availability-international.state';

/** Token of the RoundtripFlightAvailabilityInternational reducer */
export const ROUNDTRIP_FLIGHT_AVAILABILITY_INTERNATIONAL_REDUCER_TOKEN = new InjectionToken<
  ActionReducer<RoundtripFlightAvailabilityInternationalModel, Action>
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
    EffectsModule.forFeature([RoundtripFlightAvailabilityInternationalEffect]),
  ],
  providers: [
    {
      provide: ROUNDTRIP_FLIGHT_AVAILABILITY_INTERNATIONAL_REDUCER_TOKEN,
      useFactory: getDefaultRoundtripFlightAvailabilityInternationalReducer,
    },
  ],
})
export class RoundtripFlightAvailabilityInternationalStoreModule {
  public static forRoot<T extends RoundtripFlightAvailabilityInternationalModel>(
    reducerFactory: () => ActionReducer<T, Action>
  ): ModuleWithProviders<RoundtripFlightAvailabilityInternationalStoreModule> {
    return {
      ngModule: RoundtripFlightAvailabilityInternationalStoreModule,
      providers: [{ provide: ROUNDTRIP_FLIGHT_AVAILABILITY_INTERNATIONAL_REDUCER_TOKEN, useFactory: reducerFactory }],
    };
  }
}
