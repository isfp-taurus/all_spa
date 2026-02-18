import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { UpgradeWaitlistEffect } from './upgrade-waitlist.effect';
import { upgradeWaitlistReducer } from './upgrade-waitlist.reducer';
import { UPGRADE_WAITLIST_STORE_NAME, UpgradeWaitlistState } from './upgrade-waitlist.state';

/** Token of the UpgradeWaitlist reducer */
export const UPGRADE_WAITLIST_REDUCER_TOKEN = new InjectionToken<ActionReducer<UpgradeWaitlistState, Action>>(
  'Feature UpgradeWaitlist Reducer'
);

/** Provide default reducer for UpgradeWaitlist store */
export function getDefaultUpgradeWaitlistReducer() {
  return upgradeWaitlistReducer;
}

@NgModule({
  imports: [
    StoreModule.forFeature(UPGRADE_WAITLIST_STORE_NAME, UPGRADE_WAITLIST_REDUCER_TOKEN),
    EffectsModule.forFeature([UpgradeWaitlistEffect]),
  ],
  providers: [{ provide: UPGRADE_WAITLIST_REDUCER_TOKEN, useFactory: getDefaultUpgradeWaitlistReducer }],
})
export class UpgradeWaitlistStoreModule {
  public static forRoot<T extends UpgradeWaitlistState>(
    reducerFactory: () => ActionReducer<T, Action>
  ): ModuleWithProviders<UpgradeWaitlistStoreModule> {
    return {
      ngModule: UpgradeWaitlistStoreModule,
      providers: [{ provide: UPGRADE_WAITLIST_REDUCER_TOKEN, useFactory: reducerFactory }],
    };
  }
}
