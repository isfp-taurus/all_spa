import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { GetPlansEffect } from './get-plans.effect';
import { getPlansReducer } from './get-plans.reducer';
import { GET_PLANS_STORE_NAME, GetPlansState } from './get-plans.state';

/** Token of the GetPlans reducer */
export const GET_PLANS_REDUCER_TOKEN = new InjectionToken<ActionReducer<GetPlansState, Action>>(
  'Feature GetPlans Reducer'
);

/** Provide default reducer for GetPlans store */
export function getDefaultGetPlansReducer() {
  return getPlansReducer;
}

@NgModule({
  imports: [
    StoreModule.forFeature(GET_PLANS_STORE_NAME, GET_PLANS_REDUCER_TOKEN),
    EffectsModule.forFeature([GetPlansEffect]),
  ],
  providers: [{ provide: GET_PLANS_REDUCER_TOKEN, useFactory: getDefaultGetPlansReducer }],
})
export class GetPlansStoreModule {
  public static forRoot<T extends GetPlansState>(
    reducerFactory: () => ActionReducer<T, Action>
  ): ModuleWithProviders<GetPlansStoreModule> {
    return {
      ngModule: GetPlansStoreModule,
      providers: [{ provide: GET_PLANS_REDUCER_TOKEN, useFactory: reducerFactory }],
    };
  }
}
