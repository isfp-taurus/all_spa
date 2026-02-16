import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { CurrentPlanEffect } from './current-plan.effect';
import { currentPlanReducer } from './current-plan.reducer';
import { CURRENT_PLAN_STORE_NAME, CurrentPlanState } from './current-plan.state';

/** Token of the CurrentPlan reducer */
export const CURRENT_PLAN_REDUCER_TOKEN = new InjectionToken<ActionReducer<CurrentPlanState, Action>>(
  'Feature CurrentPlan Reducer'
);

/** Provide default reducer for CurrentPlan store */
export function getDefaultCurrentPlanReducer() {
  return currentPlanReducer;
}

@NgModule({
  imports: [
    StoreModule.forFeature(CURRENT_PLAN_STORE_NAME, CURRENT_PLAN_REDUCER_TOKEN),
    EffectsModule.forFeature([CurrentPlanEffect]),
  ],
  providers: [{ provide: CURRENT_PLAN_REDUCER_TOKEN, useFactory: getDefaultCurrentPlanReducer }],
})
export class CurrentPlanStoreModule {
  public static forRoot<T extends CurrentPlanState>(
    reducerFactory: () => ActionReducer<T, Action>
  ): ModuleWithProviders<CurrentPlanStoreModule> {
    return {
      ngModule: CurrentPlanStoreModule,
      providers: [{ provide: CURRENT_PLAN_REDUCER_TOKEN, useFactory: reducerFactory }],
    };
  }
}
