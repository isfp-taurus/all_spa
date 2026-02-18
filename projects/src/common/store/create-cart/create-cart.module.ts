import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { CreateCartEffect } from './create-cart.effect';
import { createCartReducer } from './create-cart.reducer';
import { CREATE_CART_STORE_NAME, CreateCartState } from './create-cart.state';

/** Token of the CreateCart reducer */
export const CREATE_CART_REDUCER_TOKEN = new InjectionToken<ActionReducer<CreateCartState, Action>>(
  'Feature CreateCart Reducer'
);

/** Provide default reducer for CreateCart store */
export function getDefaultCreateCartReducer() {
  return createCartReducer;
}

@NgModule({
  imports: [
    StoreModule.forFeature(CREATE_CART_STORE_NAME, CREATE_CART_REDUCER_TOKEN),
    EffectsModule.forFeature([CreateCartEffect]),
  ],
  providers: [{ provide: CREATE_CART_REDUCER_TOKEN, useFactory: getDefaultCreateCartReducer }],
})
export class CreateCartStoreModule {
  public static forRoot<T extends CreateCartState>(
    reducerFactory: () => ActionReducer<T, Action>
  ): ModuleWithProviders<CreateCartStoreModule> {
    return {
      ngModule: CreateCartStoreModule,
      providers: [{ provide: CREATE_CART_REDUCER_TOKEN, useFactory: reducerFactory }],
    };
  }
}
