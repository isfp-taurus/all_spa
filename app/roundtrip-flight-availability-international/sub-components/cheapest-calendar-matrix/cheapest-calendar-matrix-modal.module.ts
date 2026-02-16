import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CheapestCalendarMatrixModalComponent } from './cheapest-calendar-matrix-modal.component';
import { AmountFormatModule, DateFormatModule } from '@lib/pipes';
import { CommonSliderModule } from '@common/components/shopping/common-slider/common-slider.module';
import { StaticMsgModule } from '@lib/pipes';
import { ThrottleClickDirectiveModule } from '@lib/directives';

@NgModule({
  declarations: [CheapestCalendarMatrixModalComponent],
  imports: [
    CommonModule,
    DateFormatModule,
    AmountFormatModule,
    CommonSliderModule,
    StaticMsgModule,
    ThrottleClickDirectiveModule,
  ],
  exports: [CheapestCalendarMatrixModalComponent],
})
export class CheapestCalendarMatrixModalModule {}
