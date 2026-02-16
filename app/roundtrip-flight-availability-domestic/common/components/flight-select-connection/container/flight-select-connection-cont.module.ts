import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlightSelectConnectionContComponent } from './flight-select-connection-cont.component';
import { FlightSelectConnectionPresModule } from '../presenter/flight-select-connection-pres.module';

/**
 * 乗継情報ContModule
 */
@NgModule({
  imports: [CommonModule, FlightSelectConnectionPresModule],
  declarations: [FlightSelectConnectionContComponent],
  exports: [FlightSelectConnectionContComponent],
})
export class FlightSelectConnectionContModule {}
