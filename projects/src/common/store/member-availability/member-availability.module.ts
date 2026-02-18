import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { MemberAvailabilityEffect } from './member-availability.effect';
import { memberAvailabilityReducer } from './member-availability.reducer';
import { MEMBER_AVAILABILITY_STORE_NAME, MemberAvailabilityState } from './member-availability.state';

/** Token of the MemberAvailability reducer */
export const MEMBER_AVAILABILITY_REDUCER_TOKEN = new InjectionToken<ActionReducer<MemberAvailabilityState, Action>>(
  'Feature MemberAvailability Reducer'
);

/** Provide default reducer for MemberAvailability store */
export function getDefaultMemberAvailabilityReducer() {
  return memberAvailabilityReducer;
}

@NgModule({
  imports: [
    StoreModule.forFeature(MEMBER_AVAILABILITY_STORE_NAME, MEMBER_AVAILABILITY_REDUCER_TOKEN),
    EffectsModule.forFeature([MemberAvailabilityEffect]),
  ],
  providers: [{ provide: MEMBER_AVAILABILITY_REDUCER_TOKEN, useFactory: getDefaultMemberAvailabilityReducer }],
})
export class MemberAvailabilityStoreModule {
  public static forRoot<T extends MemberAvailabilityState>(
    reducerFactory: () => ActionReducer<T, Action>
  ): ModuleWithProviders<MemberAvailabilityStoreModule> {
    return {
      ngModule: MemberAvailabilityStoreModule,
      providers: [{ provide: MEMBER_AVAILABILITY_REDUCER_TOKEN, useFactory: reducerFactory }],
    };
  }
}
