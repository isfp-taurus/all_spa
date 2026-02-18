import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { GetMemberInformationEffect } from './get-member-information.effect';
import { getMemberInformationReducer } from './get-member-information.reducer';
import { GET_MEMBER_INFORMATION_STORE_NAME, GetMemberInformationState } from './get-member-information.state';

/** Token of the GetMemberInformation reducer */
export const GET_MEMBER_INFORMATION_REDUCER_TOKEN = new InjectionToken<
  ActionReducer<GetMemberInformationState, Action>
>('Feature GetMemberInformation Reducer');

/** Provide default reducer for GetMemberInformation store */
export function getDefaultGetMemberInformationReducer() {
  return getMemberInformationReducer;
}

@NgModule({
  imports: [
    StoreModule.forFeature(GET_MEMBER_INFORMATION_STORE_NAME, GET_MEMBER_INFORMATION_REDUCER_TOKEN),
    EffectsModule.forFeature([GetMemberInformationEffect]),
  ],
  providers: [{ provide: GET_MEMBER_INFORMATION_REDUCER_TOKEN, useFactory: getDefaultGetMemberInformationReducer }],
})
export class GetMemberInformationStoreModule {
  public static forRoot<T extends GetMemberInformationState>(
    reducerFactory: () => ActionReducer<T, Action>
  ): ModuleWithProviders<GetMemberInformationStoreModule> {
    return {
      ngModule: GetMemberInformationStoreModule,
      providers: [{ provide: GET_MEMBER_INFORMATION_REDUCER_TOKEN, useFactory: reducerFactory }],
    };
  }
}
