import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { GetApproversStoreService } from './get-approvers-store.service';
import { GetApproversStoreModule } from '../../../../store/get-approvers';

@NgModule({
  providers: [GetApproversStoreService],
  imports: [GetApproversStoreModule, EffectsModule.forRoot()],
})
export class GetApproversServiceModule {}
