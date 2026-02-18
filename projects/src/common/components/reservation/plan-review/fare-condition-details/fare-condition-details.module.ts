import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FareConditionDetailsModalComponent } from './fare-condition-details.component';
import { StaticMsgModule, MetaUrlModule } from '@lib/pipes';
import { BlockSliderModule } from '@common/components';
import { FareConditionDetailsPerBoundComponent } from './fare-condition-details-per-bound/fare-condition-details-per-bound.component';
import { FareConditionDetailsPerBoundPerPtcComponent } from './fare-condition-details-per-bound/plan-review-fare-condition-details-per-bound-per-ptc/fare-condition-details-per-bound-per-ptc.component';
import { ThrottleClickDirectiveModule } from '@lib/directives';

@NgModule({
  declarations: [
    FareConditionDetailsModalComponent,
    FareConditionDetailsPerBoundComponent,
    FareConditionDetailsPerBoundPerPtcComponent,
  ],
  imports: [CommonModule, StaticMsgModule, BlockSliderModule, ThrottleClickDirectiveModule, MetaUrlModule],
})
export class FareConditionDetailsModalModule {}
