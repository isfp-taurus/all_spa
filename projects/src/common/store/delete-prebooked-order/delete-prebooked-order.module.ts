import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { DeletePrebookedOrderEffect } from './delete-prebooked-order.effect';
import { deletePrebookedOrderReducer } from './delete-prebooked-order.reducer';
import { DELETE_PREBOOKED_ORDER_STORE_NAME, DeletePrebookedOrderState } from './delete-prebooked-order.state';

/** Token of the DeletePrebookedOrder reducer */
export const DELETE_PREBOOKED_ORDER_REDUCER_TOKEN = new InjectionToken<
  ActionReducer<DeletePrebookedOrderState, Action>
>('Feature DeletePrebookedOrder Reducer');

/** Provide default reducer for DeletePrebookedOrder store */
export function getDefaultDeletePrebookedOrderReducer() {
  return deletePrebookedOrderReducer;
}

@NgModule({
  imports: [
    StoreModule.forFeature(DELETE_PREBOOKED_ORDER_STORE_NAME, DELETE_PREBOOKED_ORDER_REDUCER_TOKEN),
    EffectsModule.forFeature([DeletePrebookedOrderEffect]),
  ],
  providers: [{ provide: DELETE_PREBOOKED_ORDER_REDUCER_TOKEN, useFactory: getDefaultDeletePrebookedOrderReducer }],
})
export class DeletePrebookedOrderStoreModule {
  public static forRoot<T extends DeletePrebookedOrderState>(
    reducerFactory: () => ActionReducer<T, Action>
  ): ModuleWithProviders<DeletePrebookedOrderStoreModule> {
    return {
      ngModule: DeletePrebookedOrderStoreModule,
      providers: [{ provide: DELETE_PREBOOKED_ORDER_REDUCER_TOKEN, useFactory: reducerFactory }],
    };
  }
}
