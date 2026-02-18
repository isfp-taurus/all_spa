import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { CurrentCartEffect } from './current-cart.effect';
import { currentCartReducer } from './current-cart.reducer';
import { CURRENT_CART_STORE_NAME, CurrentCartState } from './current-cart.state';

/** Token of the CurrentCart reducer */
export const CURRENT_CART_REDUCER_TOKEN = new InjectionToken<ActionReducer<CurrentCartState, Action>>(
  'Feature CurrentCart Reducer'
);

/** Provide default reducer for CurrentCart store */
export function getDefaultCurrentCartReducer() {
  return currentCartReducer;
}

@NgModule({
  imports: [
    StoreModule.forFeature(CURRENT_CART_STORE_NAME, CURRENT_CART_REDUCER_TOKEN),
    EffectsModule.forFeature([CurrentCartEffect]),
  ],
  providers: [{ provide: CURRENT_CART_REDUCER_TOKEN, useFactory: getDefaultCurrentCartReducer }],
})
export class CurrentCartStoreModule {
  public static forRoot<T extends CurrentCartState>(
    reducerFactory: () => ActionReducer<T, Action>
  ): ModuleWithProviders<CurrentCartStoreModule> {
    return {
      ngModule: CurrentCartStoreModule,
      providers: [{ provide: CURRENT_CART_REDUCER_TOKEN, useFactory: reducerFactory }],
    };
  }
}
