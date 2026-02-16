import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResultFlightFunctionPresComponent } from './result-flight-function-pres.component';
import { CarouselModule } from '../../../components/carousel/carousel.module';
import { StaticMsgModule } from '@lib/pipes';
import { DeviceIfDirectiveModule } from '../../../directives';
import { FlightTabListModule } from '../../../components/flight-tab-list/flight-tab-list.module';

/**
 * 検索結果操作部PresModule
 */
@NgModule({
  declarations: [ResultFlightFunctionPresComponent],
  imports: [CommonModule, CarouselModule, StaticMsgModule, DeviceIfDirectiveModule, FlightTabListModule],
  exports: [ResultFlightFunctionPresComponent],
})
export class ResultFlightFunctionPresModule {}
