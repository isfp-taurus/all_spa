import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlightBoundSelectedPresComponent } from './flight-bound-selected-pres.component';
import { StaticMsgModule } from '@lib/pipes';
import { IndicatorPopupModule, TextTooltipModule } from '@lib/components';
import { DeviceIfDirectiveModule } from '../../../directives';
import { DateFormatModule } from '@lib/pipes/date-format/date-format.module';
import { AmountFormatModule } from '../../../../../../lib/pipes/amount-format/amount-format.module';

/**
 * 選択中TS・FF情報PresModule
 */
@NgModule({
  declarations: [FlightBoundSelectedPresComponent],
  exports: [FlightBoundSelectedPresComponent],
  imports: [
    CommonModule,
    StaticMsgModule,
    IndicatorPopupModule,
    DeviceIfDirectiveModule,
    TextTooltipModule,
    DateFormatModule,
    AmountFormatModule,
  ],
})
export class FlightBoundSelectedPresModule {}
