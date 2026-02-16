import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputModule, SelectModule } from '@lib/components';
import { PaymentInputCreditCardComponent } from './payment-input-credit-card.component';
import { PaymentInputCardHolderInfoModule } from '../payment-input-common/payment-input-card-holder-info';
import { PaymentInputCreditCardReceiptModule } from '../payment-input-common/payment-input-credit-card-receipt';
import { PaymentInputCardInfoModule } from '../payment-input-common/payment-input-card-info';
import { PaymentInputCardSelectingModule } from '../payment-input-common/payment-input-card-selecting';
import { StaticMsgModule } from '@lib/pipes';
import { PaymentInputSkyCoinBallancesModule } from '../payment-input-common/payment-input-sky-coin-ballances';
import { PaymentInputSkyCoinSummaryModule } from '../payment-input-common/payment-input-sky-coin-summary';
import { PaymentInputSkyCoinUsageModule } from '../payment-input-common/payment-input-sky-coin-usage';

@NgModule({
  declarations: [PaymentInputCreditCardComponent],
  exports: [PaymentInputCreditCardComponent],
  imports: [
    CommonModule,
    PaymentInputCardHolderInfoModule,
    PaymentInputCardInfoModule,
    PaymentInputCardSelectingModule,
    PaymentInputCreditCardReceiptModule,
    InputModule,
    SelectModule,
    StaticMsgModule,
    FormsModule,
    ReactiveFormsModule,
    PaymentInputSkyCoinBallancesModule,
    PaymentInputSkyCoinSummaryModule,
    PaymentInputSkyCoinUsageModule,
  ],
})
export class PaymentInputCreditCardModule {}
