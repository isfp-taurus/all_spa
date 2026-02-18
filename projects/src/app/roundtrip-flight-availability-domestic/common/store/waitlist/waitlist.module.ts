import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { WaitlistEffect } from './waitlist.effect';
import { waitlistReducer } from './waitlist.reducer';
import { WAITLIST_STORE_NAME, WaitlistState } from './waitlist.state';

/** Token of the Waitlist reducer */
export const WAITLIST_REDUCER_TOKEN = new InjectionToken<ActionReducer<WaitlistState, Action>>(
  'Feature Waitlist Reducer'
);

/** Provide default reducer for Waitlist store */
export function getDefaultWaitlistReducer() {
  return waitlistReducer;
}

@NgModule({
  imports: [
    StoreModule.forFeature(WAITLIST_STORE_NAME, WAITLIST_REDUCER_TOKEN),
    EffectsModule.forFeature([WaitlistEffect]),
  ],
  providers: [{ provide: WAITLIST_REDUCER_TOKEN, useFactory: getDefaultWaitlistReducer }],
})
export class WaitlistStoreModule {
  public static forRoot<T extends WaitlistState>(
    reducerFactory: () => ActionReducer<T, Action>
  ): ModuleWithProviders<WaitlistStoreModule> {
    return {
      ngModule: WaitlistStoreModule,
      providers: [{ provide: WAITLIST_REDUCER_TOKEN, useFactory: reducerFactory }],
    };
  }
}
