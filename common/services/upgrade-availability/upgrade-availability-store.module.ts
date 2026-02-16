import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { UpgradeAvailabilityStoreModule } from '@common/store/upgrade-availability';
import { UpgradeAvailabilityService } from './upgrade-availability-store.service';

@NgModule({
  providers: [UpgradeAvailabilityService],
  imports: [UpgradeAvailabilityStoreModule, EffectsModule.forRoot()],
})
export class UpgradeAvailabilityStoreServicePostModule {}
