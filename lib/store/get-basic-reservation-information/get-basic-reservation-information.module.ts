import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { GetBasicReservationInformationEffect } from './get-basic-reservation-information.effect';
import { getBasicReservationInformationReducer } from './get-basic-reservation-information.reducer';
import {
  GET_BASIC_RESERVATION_INFORMATION_STORE_NAME,
  GetBasicReservationInformationState,
} from './get-basic-reservation-information.state';

/** Token of the GetBasicReservationInformation reducer */
export const GET_BASIC_RESERVATION_INFORMATION_REDUCER_TOKEN = new InjectionToken<
  ActionReducer<GetBasicReservationInformationState, Action>
>('Feature GetBasicReservationInformation Reducer');

/** Provide default reducer for GetBasicReservationInformation store */
export function getDefaultGetBasicReservationInformationReducer() {
  return getBasicReservationInformationReducer;
}

@NgModule({
  imports: [
    StoreModule.forFeature(
      GET_BASIC_RESERVATION_INFORMATION_STORE_NAME,
      GET_BASIC_RESERVATION_INFORMATION_REDUCER_TOKEN
    ),

    //StoreModule.forRoot({ [GET_BASIC_RESERVATION_INFORMATION_STORE_NAME]: getBasicReservationInformationReducer }),
    //StoreModule.forFeature(GET_BASIC_RESERVATION_INFORMATION_STORE_NAME, GET_BASIC_RESERVATION_INFORMATION_REDUCER_TOKEN),
    EffectsModule.forFeature([GetBasicReservationInformationEffect]),
  ],
  providers: [
    {
      provide: GET_BASIC_RESERVATION_INFORMATION_REDUCER_TOKEN,
      useFactory: getDefaultGetBasicReservationInformationReducer,
    },
  ],
})
export class GetBasicReservationInformationStoreModule {
  public static forRoot<T extends GetBasicReservationInformationState>(
    reducerFactory: () => ActionReducer<T, Action>
  ): ModuleWithProviders<GetBasicReservationInformationStoreModule> {
    return {
      ngModule: GetBasicReservationInformationStoreModule,
      providers: [{ provide: GET_BASIC_RESERVATION_INFORMATION_REDUCER_TOKEN, useFactory: reducerFactory }],
    };
  }
}
