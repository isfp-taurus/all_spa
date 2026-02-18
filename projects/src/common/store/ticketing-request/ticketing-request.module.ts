import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { TicketingRequestEffect } from './ticketing-request.effect';
import { ticketingRequestReducer } from './ticketing-request.reducer';
import { TICKETING_REQUEST_STORE_NAME, TicketingRequestState } from './ticketing-request.state';

/** Token of the TicketingRequest reducer */
export const TICKETING_REQUEST_REDUCER_TOKEN = new InjectionToken<ActionReducer<TicketingRequestState, Action>>(
  'Feature TicketingRequest Reducer'
);

/** Provide default reducer for TicketingRequest store */
export function getDefaultTicketingRequestReducer() {
  return ticketingRequestReducer;
}

@NgModule({
  imports: [
    StoreModule.forFeature(TICKETING_REQUEST_STORE_NAME, TICKETING_REQUEST_REDUCER_TOKEN),
    EffectsModule.forFeature([TicketingRequestEffect]),
  ],
  providers: [{ provide: TICKETING_REQUEST_REDUCER_TOKEN, useFactory: getDefaultTicketingRequestReducer }],
})
export class TicketingRequestStoreModule {
  public static forRoot<T extends TicketingRequestState>(
    reducerFactory: () => ActionReducer<T, Action>
  ): ModuleWithProviders<TicketingRequestStoreModule> {
    return {
      ngModule: TicketingRequestStoreModule,
      providers: [{ provide: TICKETING_REQUEST_REDUCER_TOKEN, useFactory: reducerFactory }],
    };
  }
}
