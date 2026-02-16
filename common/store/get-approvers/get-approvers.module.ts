import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { GetApproversEffect } from './get-approvers.effect';
import { getApproversReducer } from './get-approvers.reducer';
import { GET_APPROVERS_STORE_NAME, GetApproversState } from './get-approvers.state';

/** Token of the GetApprovers reducer */
export const GET_APPROVERS_REDUCER_TOKEN = new InjectionToken<ActionReducer<GetApproversState, Action>>(
  'Feature GetApprovers Reducer'
);

/** Provide default reducer for GetApprovers store */
export function getDefaultGetApproversReducer() {
  return getApproversReducer;
}

@NgModule({
  imports: [
    StoreModule.forFeature(GET_APPROVERS_STORE_NAME, GET_APPROVERS_REDUCER_TOKEN),
    EffectsModule.forFeature([GetApproversEffect]),
  ],
  providers: [{ provide: GET_APPROVERS_REDUCER_TOKEN, useFactory: getDefaultGetApproversReducer }],
})
export class GetApproversStoreModule {
  public static forRoot<T extends GetApproversState>(
    reducerFactory: () => ActionReducer<T, Action>
  ): ModuleWithProviders<GetApproversStoreModule> {
    return {
      ngModule: GetApproversStoreModule,
      providers: [{ provide: GET_APPROVERS_REDUCER_TOKEN, useFactory: reducerFactory }],
    };
  }
}
