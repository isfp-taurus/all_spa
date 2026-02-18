import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { FooterComponent } from './footer.component';
import { AmountFormatModule, StaticMsgModule } from '@lib/pipes';
import { PaymentDetailModalModule } from '@common/components/shopping/payment-detail/payment-detail-modal.module';
import { ThrottleClickDirectiveModule } from '@lib/directives';

@NgModule({
  declarations: [FooterComponent],
  imports: [CommonModule, TranslateModule, StaticMsgModule, AmountFormatModule, ThrottleClickDirectiveModule],
  exports: [FooterComponent],
  providers: [PaymentDetailModalModule],
})
export class FooterModule {}
