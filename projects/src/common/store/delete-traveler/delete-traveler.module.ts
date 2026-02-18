import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { DeleteTravelerEffect } from './delete-traveler.effect';
import { deleteTravelerReducer } from './delete-traveler.reducer';
import { DELETE_TRAVELER_STORE_NAME, DeleteTravelerState } from './delete-traveler.state';

/** Token of the DeleteTraveler reducer */
export const DELETE_TRAVELER_REDUCER_TOKEN = new InjectionToken<ActionReducer<DeleteTravelerState, Action>>(
  'Feature DeleteTraveler Reducer'
);

/** Provide default reducer for DeleteTraveler store */
export function getDefaultDeleteTravelerReducer() {
  return deleteTravelerReducer;
}

@NgModule({
  imports: [
    StoreModule.forFeature(DELETE_TRAVELER_STORE_NAME, DELETE_TRAVELER_REDUCER_TOKEN),
    EffectsModule.forFeature([DeleteTravelerEffect]),
  ],
  providers: [{ provide: DELETE_TRAVELER_REDUCER_TOKEN, useFactory: getDefaultDeleteTravelerReducer }],
})
export class DeleteTravelerStoreModule {
  public static forRoot<T extends DeleteTravelerState>(
    reducerFactory: () => ActionReducer<T, Action>
  ): ModuleWithProviders<DeleteTravelerStoreModule> {
    return {
      ngModule: DeleteTravelerStoreModule,
      providers: [{ provide: DELETE_TRAVELER_REDUCER_TOKEN, useFactory: reducerFactory }],
    };
  }
}
