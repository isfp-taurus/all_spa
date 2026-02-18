import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { CreateOrderEffect } from './create-order.effect';
import { createOrderReducer } from './create-order.reducer';
import { CREATE_ORDER_STORE_NAME, CreateOrderState } from './create-order.state';

/** Token of the CreateOrder reducer */
export const CREATE_ORDER_REDUCER_TOKEN = new InjectionToken<ActionReducer<CreateOrderState, Action>>(
  'Feature CreateOrder Reducer'
);

/** Provide default reducer for CreateOrder store */
export function getDefaultCreateOrderReducer() {
  return createOrderReducer;
}

@NgModule({
  imports: [
    StoreModule.forFeature(CREATE_ORDER_STORE_NAME, CREATE_ORDER_REDUCER_TOKEN),
    EffectsModule.forFeature([CreateOrderEffect]),
  ],
  providers: [{ provide: CREATE_ORDER_REDUCER_TOKEN, useFactory: getDefaultCreateOrderReducer }],
})
export class CreateOrderStoreModule {
  public static forRoot<T extends CreateOrderState>(
    reducerFactory: () => ActionReducer<T, Action>
  ): ModuleWithProviders<CreateOrderStoreModule> {
    return {
      ngModule: CreateOrderStoreModule,
      providers: [{ provide: CREATE_ORDER_REDUCER_TOKEN, useFactory: reducerFactory }],
    };
  }
}
