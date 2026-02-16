import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlightDetailItemPresComponent } from './flight-detail-item-pres.component';
import { StaticMsgModule, MetaUrlModule } from '@lib/pipes';
import { IndicatorPopupModule, TextTooltipModule } from '@lib/components';
import { DeviceIfDirectiveModule } from '../../../directives';
import { DateFormatModule } from '../../../../../../lib/pipes/date-format/date-format.module';

/**
 * フライト詳細PresModule
 */
@NgModule({
  declarations: [FlightDetailItemPresComponent],
  exports: [FlightDetailItemPresComponent],
  imports: [
    CommonModule,
    StaticMsgModule,
    IndicatorPopupModule,
    TextTooltipModule,
    DeviceIfDirectiveModule,
    DateFormatModule,
    MetaUrlModule,
  ],
})
export class FlightDetailItemPresModule {}
