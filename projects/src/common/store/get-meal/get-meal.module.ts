import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { GetMealEffect } from './get-meal.effect';
import { getMealReducer } from './get-meal.reducer';
import { GET_MEAL_STORE_NAME, GetMealState } from './get-meal.state';

/** Token of the GetMeal reducer */
export const GET_MEAL_REDUCER_TOKEN = new InjectionToken<ActionReducer<GetMealState, Action>>(
  'Feature GetMeal Reducer'
);

/** Provide default reducer for GetMeal store */
export function getDefaultGetMealReducer() {
  return getMealReducer;
}

@NgModule({
  imports: [
    StoreModule.forFeature(GET_MEAL_STORE_NAME, GET_MEAL_REDUCER_TOKEN),
    EffectsModule.forFeature([GetMealEffect]),
  ],
  providers: [{ provide: GET_MEAL_REDUCER_TOKEN, useFactory: getDefaultGetMealReducer }],
})
export class GetMealStoreModule {
  public static forRoot<T extends GetMealState>(
    reducerFactory: () => ActionReducer<T, Action>
  ): ModuleWithProviders<GetMealStoreModule> {
    return {
      ngModule: GetMealStoreModule,
      providers: [{ provide: GET_MEAL_REDUCER_TOKEN, useFactory: reducerFactory }],
    };
  }
}
