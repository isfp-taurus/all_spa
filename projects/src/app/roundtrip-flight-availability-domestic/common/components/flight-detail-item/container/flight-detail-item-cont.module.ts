import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlightDetailItemContComponent } from './flight-detail-item-cont.component';
import { FlightDetailItemPresModule } from '../presenter/flight-detail-item-pres.module';

/**
 * フライト詳細ContModule
 */
@NgModule({
  imports: [CommonModule, FlightDetailItemPresModule],
  declarations: [FlightDetailItemContComponent],
  exports: [FlightDetailItemContComponent],
})
export class FlightDetailItemContModule {}
