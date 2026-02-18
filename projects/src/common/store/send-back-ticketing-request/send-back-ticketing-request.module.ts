import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { SendBackTicketingRequestEffect } from './send-back-ticketing-request.effect';
import { sendBackTicketingRequestReducer } from './send-back-ticketing-request.reducer';
import {
  SEND_BACK_TICKETING_REQUEST_STORE_NAME,
  SendBackTicketingRequestState,
} from './send-back-ticketing-request.state';

/** Token of the SendBackTicketingRequest reducer */
export const SEND_BACK_TICKETING_REQUEST_REDUCER_TOKEN = new InjectionToken<
  ActionReducer<SendBackTicketingRequestState, Action>
>('Feature SendBackTicketingRequest Reducer');

/** Provide default reducer for SendBackTicketingRequest store */
export function getDefaultSendBackTicketingRequestReducer() {
  return sendBackTicketingRequestReducer;
}

@NgModule({
  imports: [
    StoreModule.forFeature(SEND_BACK_TICKETING_REQUEST_STORE_NAME, SEND_BACK_TICKETING_REQUEST_REDUCER_TOKEN),
    EffectsModule.forFeature([SendBackTicketingRequestEffect]),
  ],
  providers: [
    { provide: SEND_BACK_TICKETING_REQUEST_REDUCER_TOKEN, useFactory: getDefaultSendBackTicketingRequestReducer },
  ],
})
export class SendBackTicketingRequestStoreModule {
  public static forRoot<T extends SendBackTicketingRequestState>(
    reducerFactory: () => ActionReducer<T, Action>
  ): ModuleWithProviders<SendBackTicketingRequestStoreModule> {
    return {
      ngModule: SendBackTicketingRequestStoreModule,
      providers: [{ provide: SEND_BACK_TICKETING_REQUEST_REDUCER_TOKEN, useFactory: reducerFactory }],
    };
  }
}
