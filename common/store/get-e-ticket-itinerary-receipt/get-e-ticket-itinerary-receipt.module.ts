import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { GetETicketItineraryReceiptEffect } from './get-e-ticket-itinerary-receipt.effect';
import { getETicketItineraryReceiptReducer } from './get-e-ticket-itinerary-receipt.reducer';
import {
  GET_E_TICKET_ITINERARY_RECEIPT_STORE_NAME,
  GetETicketItineraryReceiptState,
} from './get-e-ticket-itinerary-receipt.state';

/** Token of the GetETicketItineraryReceipt reducer */
export const GET_E_TICKET_ITINERARY_RECEIPT_REDUCER_TOKEN = new InjectionToken<
  ActionReducer<GetETicketItineraryReceiptState, Action>
>('Feature GetETicketItineraryReceipt Reducer');

/** Provide default reducer for GetETicketItineraryReceipt store */
export function getDefaultGetETicketItineraryReceiptReducer() {
  return getETicketItineraryReceiptReducer;
}

@NgModule({
  imports: [
    StoreModule.forFeature(GET_E_TICKET_ITINERARY_RECEIPT_STORE_NAME, GET_E_TICKET_ITINERARY_RECEIPT_REDUCER_TOKEN),
    EffectsModule.forFeature([GetETicketItineraryReceiptEffect]),
  ],
  providers: [
    { provide: GET_E_TICKET_ITINERARY_RECEIPT_REDUCER_TOKEN, useFactory: getDefaultGetETicketItineraryReceiptReducer },
  ],
})
export class GetETicketItineraryReceiptStoreModule {
  public static forRoot<T extends GetETicketItineraryReceiptState>(
    reducerFactory: () => ActionReducer<T, Action>
  ): ModuleWithProviders<GetETicketItineraryReceiptStoreModule> {
    return {
      ngModule: GetETicketItineraryReceiptStoreModule,
      providers: [{ provide: GET_E_TICKET_ITINERARY_RECEIPT_REDUCER_TOKEN, useFactory: reducerFactory }],
    };
  }
}
