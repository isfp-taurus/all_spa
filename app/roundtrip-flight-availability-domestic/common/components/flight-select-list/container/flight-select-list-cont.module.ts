import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlightSelectListContComponent } from './flight-select-list-cont.component';
import { FlightSelectListPresModule } from '../presenter/flight-select-list-pres.module';

/**
 * セグメント情報ContModule
 */
@NgModule({
  imports: [CommonModule, FlightSelectListPresModule],
  declarations: [FlightSelectListContComponent],
  exports: [FlightSelectListContComponent],
})
export class FlightSelectListContModule {}
