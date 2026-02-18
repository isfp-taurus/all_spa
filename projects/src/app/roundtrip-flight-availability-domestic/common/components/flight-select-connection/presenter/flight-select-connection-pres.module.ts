import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlightSelectConnectionPresComponent } from './flight-select-connection-pres.component';
import { StaticMsgModule } from '@lib/pipes';
import { DateFormatModule } from '@lib/pipes/date-format/date-format.module';

/**
 * 乗継情報PresModule
 */
@NgModule({
  declarations: [FlightSelectConnectionPresComponent],
  exports: [FlightSelectConnectionPresComponent],
  imports: [CommonModule, StaticMsgModule, DateFormatModule],
})
export class FlightSelectConnectionPresModule {}
