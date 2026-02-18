import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { PlanListEffect } from './plan-list.effect';
import { planListReducer } from './plan-list.reducer';
import { PLAN_LIST_STORE_NAME, PlanListState } from './plan-list.state';

/** Token of the PlanList reducer */
export const PLAN_LIST_REDUCER_TOKEN = new InjectionToken<ActionReducer<PlanListState, Action>>(
  'Feature PlanList Reducer'
);

/** Provide default reducer for PlanList store */
export function getDefaultPlanListReducer() {
  return planListReducer;
}

@NgModule({
  imports: [
    StoreModule.forFeature(PLAN_LIST_STORE_NAME, PLAN_LIST_REDUCER_TOKEN),
    EffectsModule.forFeature([PlanListEffect]),
  ],
  providers: [{ provide: PLAN_LIST_REDUCER_TOKEN, useFactory: getDefaultPlanListReducer }],
})
export class PlanListStoreModule {
  public static forRoot<T extends PlanListState>(
    reducerFactory: () => ActionReducer<T, Action>
  ): ModuleWithProviders<PlanListStoreModule> {
    return {
      ngModule: PlanListStoreModule,
      providers: [{ provide: PLAN_LIST_REDUCER_TOKEN, useFactory: reducerFactory }],
    };
  }
}
