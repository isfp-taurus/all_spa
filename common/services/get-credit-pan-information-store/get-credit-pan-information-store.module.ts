import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GetCreditPanInformationStoreService } from './get-credit-pan-information-store.service';
import { GetCreditPanInformationStoreModule } from '@common/store';
import { EffectsModule } from '@ngrx/effects';

@NgModule({
  declarations: [],
  providers: [GetCreditPanInformationStoreService],
  imports: [CommonModule, GetCreditPanInformationStoreModule, EffectsModule.forRoot()],
})
export class GetCreditPanInformationServiceModule {}
