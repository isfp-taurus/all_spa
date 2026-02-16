import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { StaticMsgModule } from '@lib/pipes';
import { BookingCompletedButtonAreaComponent } from './booking-completed-button-area.component';
import { AllSiteDirectiveModule, ThrottleClickDirectiveModule } from '@lib/directives';

@NgModule({
  declarations: [BookingCompletedButtonAreaComponent],
  imports: [CommonModule, StaticMsgModule, AllSiteDirectiveModule, ThrottleClickDirectiveModule],
  exports: [BookingCompletedButtonAreaComponent],
})
export class BookingCompletedButtonAreaModule {}
