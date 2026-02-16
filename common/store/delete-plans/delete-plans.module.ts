import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { DeletePlansEffect } from './delete-plans.effect';
import { deletePlansReducer } from './delete-plans.reducer';
import { DELETE_PLANS_STORE_NAME, DeletePlansState } from './delete-plans.state';

/** Token of the DeletePlans reducer */
export const DELETE_PLANS_REDUCER_TOKEN = new InjectionToken<ActionReducer<DeletePlansState, Action>>(
  'Feature DeletePlans Reducer'
);

/** Provide default reducer for DeletePlans store */
export function getDefaultDeletePlansReducer() {
  return deletePlansReducer;
}

@NgModule({
  imports: [
    StoreModule.forFeature(DELETE_PLANS_STORE_NAME, DELETE_PLANS_REDUCER_TOKEN),
    EffectsModule.forFeature([DeletePlansEffect]),
  ],
  providers: [{ provide: DELETE_PLANS_REDUCER_TOKEN, useFactory: getDefaultDeletePlansReducer }],
})
export class DeletePlansStoreModule {
  public static forRoot<T extends DeletePlansState>(
    reducerFactory: () => ActionReducer<T, Action>
  ): ModuleWithProviders<DeletePlansStoreModule> {
    return {
      ngModule: DeletePlansStoreModule,
      providers: [{ provide: DELETE_PLANS_REDUCER_TOKEN, useFactory: reducerFactory }],
    };
  }
}
