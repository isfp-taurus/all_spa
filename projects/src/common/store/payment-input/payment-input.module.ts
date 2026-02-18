import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { PaymentInputEffect } from './payment-input.effect';
import { paymentInputReducer } from './payment-input.reducer';
import { PAYMENT_INPUT_STORE_NAME, PaymentInputState } from './payment-input.state';

/** Token of the PaymentInput reducer */
export const PAYMENT_INPUT_REDUCER_TOKEN = new InjectionToken<ActionReducer<PaymentInputState, Action>>(
  'Feature PaymentInput Reducer'
);

/** Provide default reducer for PaymentInput store */
export function getDefaultPaymentInputReducer() {
  return paymentInputReducer;
}

@NgModule({
  imports: [
    StoreModule.forFeature(PAYMENT_INPUT_STORE_NAME, PAYMENT_INPUT_REDUCER_TOKEN),
    EffectsModule.forFeature([PaymentInputEffect]),
  ],
  providers: [{ provide: PAYMENT_INPUT_REDUCER_TOKEN, useFactory: getDefaultPaymentInputReducer }],
})
export class PaymentInputStoreModule {
  public static forRoot<T extends PaymentInputState>(
    reducerFactory: () => ActionReducer<T, Action>
  ): ModuleWithProviders<PaymentInputStoreModule> {
    return {
      ngModule: PaymentInputStoreModule,
      providers: [{ provide: PAYMENT_INPUT_REDUCER_TOKEN, useFactory: reducerFactory }],
    };
  }
}
