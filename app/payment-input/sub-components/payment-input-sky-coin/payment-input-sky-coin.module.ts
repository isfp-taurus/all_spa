import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentInputSkyCoinComponent } from './payment-input-sky-coin.component';
import { PaymentInputSkyCoinUsageModule } from '../payment-input-common/payment-input-sky-coin-usage/payment-input-sky-coin-usage.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PaymentInputSkyCoinSummaryModule } from '../payment-input-common/payment-input-sky-coin-summary/payment-input-sky-coin-summary.module';
import { PaymentInputSkyCoinBallancesModule } from '../payment-input-common/payment-input-sky-coin-ballances/payment-input-sky-coin-ballances.module';
import { PaymentInputCardHolderInfoModule } from '../payment-input-common/payment-input-card-holder-info/payment-input-card-holder-info.module';
import { PaymentInputCardInfoModule } from '../payment-input-common/payment-input-card-info/payment-input-card-info.module';
import { PaymentInputCardSelectingModule } from '../payment-input-common/payment-input-card-selecting/payment-input-card-selecting.module';
import { PaymentInputCreditCardReceiptModule } from '../payment-input-common/payment-input-credit-card-receipt/payment-input-credit-card-receipt.module';
import { InputModule, SelectModule } from '@lib/components';
import { StaticMsgModule } from '@lib/pipes';

@NgModule({
  declarations: [PaymentInputSkyCoinComponent],
  exports: [PaymentInputSkyCoinComponent],
  imports: [
    CommonModule,
    PaymentInputSkyCoinBallancesModule,
    PaymentInputSkyCoinUsageModule,
    PaymentInputSkyCoinSummaryModule,
    FormsModule,
    ReactiveFormsModule,
    StaticMsgModule,
    InputModule,
    SelectModule,
    PaymentInputCardHolderInfoModule,
    PaymentInputCardInfoModule,
    PaymentInputCardSelectingModule,
    PaymentInputCreditCardReceiptModule,
  ],
})
export class PaymentInputSkyCoinModule {}
