import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { CreatePlansEffect } from './create-plans.effect';
import { createPlansReducer } from './create-plans.reducer';
import { CREATE_PLANS_STORE_NAME, CreatePlansState } from './create-plans.state';

/** Token of the CreatePlans reducer */
export const CREATE_PLANS_REDUCER_TOKEN = new InjectionToken<ActionReducer<CreatePlansState, Action>>(
  'Feature CreatePlans Reducer'
);

/** Provide default reducer for CreatePlans store */
export function getDefaultCreatePlansReducer() {
  return createPlansReducer;
}

@NgModule({
  imports: [
    StoreModule.forFeature(CREATE_PLANS_STORE_NAME, CREATE_PLANS_REDUCER_TOKEN),
    EffectsModule.forFeature([CreatePlansEffect]),
  ],
  providers: [{ provide: CREATE_PLANS_REDUCER_TOKEN, useFactory: getDefaultCreatePlansReducer }],
})
export class CreatePlansStoreModule {
  public static forRoot<T extends CreatePlansState>(
    reducerFactory: () => ActionReducer<T, Action>
  ): ModuleWithProviders<CreatePlansStoreModule> {
    return {
      ngModule: CreatePlansStoreModule,
      providers: [{ provide: CREATE_PLANS_REDUCER_TOKEN, useFactory: reducerFactory }],
    };
  }
}
