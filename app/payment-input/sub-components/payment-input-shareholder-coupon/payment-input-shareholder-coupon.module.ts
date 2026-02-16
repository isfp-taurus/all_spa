import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentInputShareholderCouponComponent } from './payment-input-shareholder-coupon.component';
import { StaticMsgModule } from '@lib/pipes';
import { InputModule } from '@lib/components';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [PaymentInputShareholderCouponComponent],
  imports: [CommonModule, StaticMsgModule, InputModule, FormsModule, ReactiveFormsModule],
  exports: [PaymentInputShareholderCouponComponent],
})
export class PaymentInputShareholderCouponModule {}
