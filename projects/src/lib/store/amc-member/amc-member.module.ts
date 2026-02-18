import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';
import { amcMemberReducer } from './amc-member.reducer';
import { AMC_MEMBER_STORE_NAME, AMCMemberState } from './amc-member.state';

/** Token of the AMCMember reducer */
export const AMC_MEMBER_REDUCER_TOKEN = new InjectionToken<ActionReducer<AMCMemberState, Action>>(
  'Feature AMCMember Reducer'
);

/** Provide default reducer for AMCMember store */
export function getDefaultAMCMemberReducer() {
  return amcMemberReducer;
}

@NgModule({
  imports: [StoreModule.forFeature(AMC_MEMBER_STORE_NAME, AMC_MEMBER_REDUCER_TOKEN)],
  providers: [{ provide: AMC_MEMBER_REDUCER_TOKEN, useFactory: getDefaultAMCMemberReducer }],
})
export class AMCMemberStoreModule {
  public static forRoot<T extends AMCMemberState>(
    reducerFactory: () => ActionReducer<T, Action>
  ): ModuleWithProviders<AMCMemberStoreModule> {
    return {
      ngModule: AMCMemberStoreModule,
      providers: [{ provide: AMC_MEMBER_REDUCER_TOKEN, useFactory: reducerFactory }],
    };
  }
}
