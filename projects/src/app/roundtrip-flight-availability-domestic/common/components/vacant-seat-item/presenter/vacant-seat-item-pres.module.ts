import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VacantSeatItemPresComponent } from './vacant-seat-item-pres.component';
import { StaticMsgModule } from '@lib/pipes';
import { IndicatorPopupModule, TextTooltipModule } from '@lib/components';
import { FlightDetailItemContModule } from '../../flight-detail-item/container/flight-detail-item-cont.module';
import { FlightSelectConnectionContModule } from '../../../components/flight-select-connection/container/flight-select-connection-cont.module';
import { AmountFormatModule } from '@lib/pipes/amount-format/amount-format.module';
import { DateFormatModule } from '@lib/pipes/date-format/date-format.module';

/**
 * フライトサマリPresModule
 */
@NgModule({
  declarations: [VacantSeatItemPresComponent],
  exports: [VacantSeatItemPresComponent],
  imports: [
    CommonModule,
    StaticMsgModule,
    IndicatorPopupModule,
    FlightDetailItemContModule,
    FlightSelectConnectionContModule,
    TextTooltipModule,
    AmountFormatModule,
    DateFormatModule,
  ],
})
export class VacantSeatItemPresModule {}
