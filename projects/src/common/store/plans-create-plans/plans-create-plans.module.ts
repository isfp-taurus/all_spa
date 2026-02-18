import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { PlansCreatePlansEffect } from './plans-create-plans.effect';
import { plansCreatePlansReducer } from './plans-create-plans.reducer';
import { PLANS_CREATE_PLANS_STORE_NAME, PlansCreatePlansState } from './plans-create-plans.state';

/** Token of the PlansCreatePlans reducer */
export const PLANS_CREATE_PLANS_REDUCER_TOKEN = new InjectionToken<ActionReducer<PlansCreatePlansState, Action>>(
  'Feature PlansCreatePlans Reducer'
);

/** Provide default reducer for PlansCreatePlans store */
export function getDefaultPlansCreatePlansReducer() {
  return plansCreatePlansReducer;
}

@NgModule({
  imports: [
    StoreModule.forFeature(PLANS_CREATE_PLANS_STORE_NAME, PLANS_CREATE_PLANS_REDUCER_TOKEN),
    EffectsModule.forFeature([PlansCreatePlansEffect]),
  ],
  providers: [{ provide: PLANS_CREATE_PLANS_REDUCER_TOKEN, useFactory: getDefaultPlansCreatePlansReducer }],
})
export class PlansCreatePlansStoreModule {
  public static forRoot<T extends PlansCreatePlansState>(
    reducerFactory: () => ActionReducer<T, Action>
  ): ModuleWithProviders<PlansCreatePlansStoreModule> {
    return {
      ngModule: PlansCreatePlansStoreModule,
      providers: [{ provide: PLANS_CREATE_PLANS_REDUCER_TOKEN, useFactory: reducerFactory }],
    };
  }
}
