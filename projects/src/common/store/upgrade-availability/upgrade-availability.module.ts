import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { UpgradeAvailabilityEffect } from './upgrade-availability.effect';
import { upgradeAvailabilityReducer } from './upgrade-availability.reducer';
import { UPGRADE_AVAILABILITY_STORE_NAME, UpgradeAvailabilityState } from './upgrade-availability.state';

/** Token of the UpgradeAvailability reducer */
export const UPGRADE_AVAILABILITY_REDUCER_TOKEN = new InjectionToken<ActionReducer<UpgradeAvailabilityState, Action>>(
  'Feature UpgradeAvailability Reducer'
);

/** Provide default reducer for UpgradeAvailability store */
export function getDefaultUpgradeAvailabilityReducer() {
  return upgradeAvailabilityReducer;
}

@NgModule({
  imports: [
    StoreModule.forFeature(UPGRADE_AVAILABILITY_STORE_NAME, UPGRADE_AVAILABILITY_REDUCER_TOKEN),
    EffectsModule.forFeature([UpgradeAvailabilityEffect]),
  ],
  providers: [{ provide: UPGRADE_AVAILABILITY_REDUCER_TOKEN, useFactory: getDefaultUpgradeAvailabilityReducer }],
})
export class UpgradeAvailabilityStoreModule {
  public static forRoot<T extends UpgradeAvailabilityState>(
    reducerFactory: () => ActionReducer<T, Action>
  ): ModuleWithProviders<UpgradeAvailabilityStoreModule> {
    return {
      ngModule: UpgradeAvailabilityStoreModule,
      providers: [{ provide: UPGRADE_AVAILABILITY_REDUCER_TOKEN, useFactory: reducerFactory }],
    };
  }
}
