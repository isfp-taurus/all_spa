import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { GetAwardUsersEffect } from './get-award-users.effect';
import { getAwardUsersReducer } from './get-award-users.reducer';
import { GET_AWARD_USERS_STORE_NAME, GetAwardUsersState } from './get-award-users.state';

/** Token of the GetAwardUsers reducer */
export const GET_AWARD_USERS_REDUCER_TOKEN = new InjectionToken<ActionReducer<GetAwardUsersState, Action>>(
  'Feature GetAwardUsers Reducer'
);

/** Provide default reducer for GetAwardUsers store */
export function getDefaultGetAwardUsersReducer() {
  return getAwardUsersReducer;
}

@NgModule({
  imports: [
    StoreModule.forFeature(GET_AWARD_USERS_STORE_NAME, GET_AWARD_USERS_REDUCER_TOKEN),
    EffectsModule.forFeature([GetAwardUsersEffect]),
  ],
  providers: [{ provide: GET_AWARD_USERS_REDUCER_TOKEN, useFactory: getDefaultGetAwardUsersReducer }],
})
export class GetAwardUsersStoreModule {
  public static forRoot<T extends GetAwardUsersState>(
    reducerFactory: () => ActionReducer<T, Action>
  ): ModuleWithProviders<GetAwardUsersStoreModule> {
    return {
      ngModule: GetAwardUsersStoreModule,
      providers: [{ provide: GET_AWARD_USERS_REDUCER_TOKEN, useFactory: reducerFactory }],
    };
  }
}
