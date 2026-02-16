import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentTermsComponent } from './payment-terms.component';
import { TranslateModule } from '@ngx-translate/core';
import { AmountFormatModule, StaticMsgModule } from '@lib/pipes';
import { GetOrderStoreServiceModule } from '@common/services';
import { BlockSliderModule } from '@common/components/feature-parts/block-slider/block-slider.module';

@NgModule({
  declarations: [PaymentTermsComponent],
  imports: [
    CommonModule,
    TranslateModule,
    AmountFormatModule,
    StaticMsgModule,
    BlockSliderModule,
    GetOrderStoreServiceModule,
  ],
  exports: [PaymentTermsComponent],
})
export class PaymentTermsModule {}
