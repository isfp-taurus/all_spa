import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { GetEstimationEffect } from './get-estimation.effect';
import { getEstimationReducer } from './get-estimation.reducer';
import { GET_ESTIMATION_STORE_NAME, GetEstimationState } from './get-estimation.state';

/** Token of the GetEstimation reducer */
export const GET_ESTIMATION_REDUCER_TOKEN = new InjectionToken<ActionReducer<GetEstimationState, Action>>(
  'Feature GetEstimation Reducer'
);

/** Provide default reducer for GetEstimation store */
export function getDefaultGetEstimationReducer() {
  return getEstimationReducer;
}

@NgModule({
  imports: [
    StoreModule.forFeature(GET_ESTIMATION_STORE_NAME, GET_ESTIMATION_REDUCER_TOKEN),
    EffectsModule.forFeature([GetEstimationEffect]),
  ],
  providers: [{ provide: GET_ESTIMATION_REDUCER_TOKEN, useFactory: getDefaultGetEstimationReducer }],
})
export class GetEstimationStoreModule {
  public static forRoot<T extends GetEstimationState>(
    reducerFactory: () => ActionReducer<T, Action>
  ): ModuleWithProviders<GetEstimationStoreModule> {
    return {
      ngModule: GetEstimationStoreModule,
      providers: [{ provide: GET_ESTIMATION_REDUCER_TOKEN, useFactory: reducerFactory }],
    };
  }
}
