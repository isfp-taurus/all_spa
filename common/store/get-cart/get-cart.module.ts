import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { GetCartEffect } from './get-cart.effect';
import { getCartReducer } from './get-cart.reducer';
import { GET_CART_STORE_NAME, GetCartState } from './get-cart.state';

/** Token of the GetCart reducer */
export const GET_CART_REDUCER_TOKEN = new InjectionToken<ActionReducer<GetCartState, Action>>(
  'Feature GetCart Reducer'
);

/** Provide default reducer for GetCart store */
export function getDefaultGetCartReducer() {
  return getCartReducer;
}

@NgModule({
  imports: [
    StoreModule.forFeature(GET_CART_STORE_NAME, GET_CART_REDUCER_TOKEN),
    EffectsModule.forFeature([GetCartEffect]),
  ],
  providers: [{ provide: GET_CART_REDUCER_TOKEN, useFactory: getDefaultGetCartReducer }],
})
export class GetCartStoreModule {
  public static forRoot<T extends GetCartState>(
    reducerFactory: () => ActionReducer<T, Action>
  ): ModuleWithProviders<GetCartStoreModule> {
    return {
      ngModule: GetCartStoreModule,
      providers: [{ provide: GET_CART_REDUCER_TOKEN, useFactory: reducerFactory }],
    };
  }
}
