import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { PaymentInputSubHeaderComponent } from './payment-input-sub-header.component';
import { LinkUrlModule, LinkUrlPipe, StaticMsgModule, StaticMsgPipe } from '@lib/pipes';
import { ThrottleClickDirectiveModule } from '@lib/directives';

@NgModule({
  declarations: [PaymentInputSubHeaderComponent],
  exports: [PaymentInputSubHeaderComponent],
  imports: [CommonModule, TranslateModule, StaticMsgModule, LinkUrlModule, ThrottleClickDirectiveModule],
  providers: [StaticMsgPipe, LinkUrlPipe],
})
export class PaymentInputSubHeaderModule {}
