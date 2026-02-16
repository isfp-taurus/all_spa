import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EffectsModule } from '@ngrx/effects';
import { MemberAvailabilityStoreService } from './member-availability-store.service';
import { MemberAvailabilityStoreModule } from '@common/store/member-availability';

@NgModule({
  declarations: [],
  providers: [MemberAvailabilityStoreService],
  imports: [CommonModule, MemberAvailabilityStoreModule, EffectsModule.forRoot()],
})
export class MemberAvailabilityStoreServiceModule {}
