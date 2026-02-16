import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlightBoundContComponent } from './flight-bound-cont.component';
import { FlightBoundPresModule } from '../presenter/flight-bound-pres.module';

/**
 * バウンドリストContModule
 */
@NgModule({
  declarations: [FlightBoundContComponent],
  imports: [CommonModule, FlightBoundPresModule],
  exports: [FlightBoundContComponent],
})
export class FlightBoundContModule {}
