import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlightSelectListPresComponent } from './flight-select-list-pres.component';
import { StaticMsgModule, MetaUrlModule } from '@lib/pipes';
import { IndicatorPopupModule, TextTooltipModule } from '@lib/components';
import { DateFormatModule } from '@lib/pipes';
import { ThrottleClickDirectiveModule } from '@lib/directives';
import { DeviceIfDirectiveModule } from '../../../../common/directives';

/**
 * セグメント情報PresModule
 */
@NgModule({
  imports: [
    CommonModule,
    StaticMsgModule,
    IndicatorPopupModule,
    DateFormatModule,
    TextTooltipModule,
    ThrottleClickDirectiveModule,
    DeviceIfDirectiveModule,
    MetaUrlModule,
  ],
  declarations: [FlightSelectListPresComponent],
  exports: [FlightSelectListPresComponent],
})
export class FlightSelectListPresModule {}
