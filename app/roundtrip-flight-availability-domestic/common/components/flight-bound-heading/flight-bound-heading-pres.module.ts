import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlightBoundHeadingPresComponent } from './flight-bound-heading-pres.component';
import { StaticMsgModule } from '@lib/pipes';

/**
 * バウンドヘッダPresModule
 */
@NgModule({
  declarations: [FlightBoundHeadingPresComponent],
  imports: [CommonModule, StaticMsgModule],
  exports: [FlightBoundHeadingPresComponent],
})
export class FlightBoundHeadingPresModule {}
