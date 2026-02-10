import { NgModule } from '@angular/core'; 
import { CommonModule } from '@angular/common' ; 
import { PaymentDetailsComponent } from './payment-details.component'; 
import { TranslateModule } from '@ngx-translate/core';
import { AmountFormatModule, StaticMsgModule } from '@lib/pipes';
import { PaymentDetailsSummaryComponent } from '/payment-details-summary/payment-details-summary .component' ; 
import { PaymentDetailsBreakdownComponent } from './payment-details-breakdown/payment-details-breakdown.component';
import { PaymentDetailsBreakdownItemComponent } from './payment-details-breakdown/payment-details-breakdown-item/payment-details-breakdown-item.component';
import { GetOrderStoreServiceModule } from '@common/services';
import { BlocksliderModule } from '@common/components/feature-parts/block-slider/block-slider-module'; 
import { MilesFormatModule } from '@common/pipes/miles-format/miles-format.module' ;

@NgModule( {
declarations: [
PaymentDetailsComponent, 
PaymentDetailsSummaryComponent, 
PaymentDetailsBreakdownComponent, 
PaymentDetailsBreakdownItemComponent,
],
imports: [
CommonModule, 
TranslateModule, 
AmountFormatModule, 
StaticMsgModule,
BlocksliderModule, 
GetOrderStoreServiceModule, 
MilesFormatModule,
],
exports: [PaymentDetailsComponent],
})
export class PaymentDetailsModule {}