import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnabizPaymentInputContComponent } from './anabiz-payment-input-cont.component';
import { RouterModule } from '@angular/router';
import { LinkUrlModule } from '@lib/pipes';
import { AnabizPaymentInputPresModule } from '../presenter';

@NgModule({
  declarations: [AnabizPaymentInputContComponent],
  imports: [
    RouterModule.forChild([{ path: '', component: AnabizPaymentInputContComponent }]),
    CommonModule,
    LinkUrlModule,
    AnabizPaymentInputPresModule,
  ],
  exports: [AnabizPaymentInputContComponent],
})
export class AnabizPaymentInputContModule {}
