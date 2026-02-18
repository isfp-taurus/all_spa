import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentInputSkyCoinBallancesComponent } from './payment-input-sky-coin-ballances.component';
import { StaticMsgModule, MetaUrlModule } from '@lib/pipes';
import { ThrottleClickDirectiveModule } from '@lib/directives';

@NgModule({
  declarations: [PaymentInputSkyCoinBallancesComponent],
  exports: [PaymentInputSkyCoinBallancesComponent],
  imports: [CommonModule, StaticMsgModule, ThrottleClickDirectiveModule, MetaUrlModule],
})
export class PaymentInputSkyCoinBallancesModule {}
