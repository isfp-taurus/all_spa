import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UpsellService } from './upsell.service';
import { DateFormatModule, AmountFormatModule, DateFormatPipe, AmountFormatPipe } from '@lib/pipes';
import {
  CancelPrebookServiceModule,
  CurrentCartStoreServiceModule,
  DeliveryInformationStoreServiceModule,
  PlanReviewStoreServiceModule,
  RoundtripOwdStoreServiceModule,
  UpdateAirOffersStoreServiceModule,
} from '@common/services';

@NgModule({
  providers: [UpsellService, DateFormatPipe, AmountFormatPipe],
  imports: [
    CommonModule,
    RoundtripOwdStoreServiceModule,
    CurrentCartStoreServiceModule,
    PlanReviewStoreServiceModule,
    DateFormatModule,
    AmountFormatModule,
    CancelPrebookServiceModule,
    UpdateAirOffersStoreServiceModule,
    DeliveryInformationStoreServiceModule,
  ],
})
export class UpsellServiceModule {}
