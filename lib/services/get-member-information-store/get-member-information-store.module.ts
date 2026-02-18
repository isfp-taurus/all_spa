import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GetMemberInformationStoreService } from './get-member-information-store.service';
import { EffectsModule } from '@ngrx/effects';
import { GetMemberInformationStoreModule } from '@lib/store';

@NgModule({
  declarations: [],
  providers: [GetMemberInformationStoreService],
  imports: [CommonModule, GetMemberInformationStoreModule, EffectsModule.forRoot()],
})
export class GetMemberInformationStoreServiceModule {}
