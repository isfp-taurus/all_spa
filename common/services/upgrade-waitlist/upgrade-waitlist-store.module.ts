import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { UpgradeWaitlistStoreModule } from '@common/store/upgrade-waitlist';
import { UpgradeWaitlistStoreService } from './upgrade-waitlist-store.service';

@NgModule({
  providers: [UpgradeWaitlistStoreService],
  imports: [UpgradeWaitlistStoreModule, EffectsModule.forRoot()],
})
export class UpgradeWaitlistStoreServiceModule {}
