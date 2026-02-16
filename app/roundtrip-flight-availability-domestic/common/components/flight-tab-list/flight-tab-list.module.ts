import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlightTabListComponent } from './flight-tab-list.component';
import { StaticMsgModule } from '@lib/pipes';

/**
 * キャビンクラス切替Module
 */
@NgModule({
  declarations: [FlightTabListComponent],
  imports: [CommonModule, StaticMsgModule],
  exports: [FlightTabListComponent],
})
export class FlightTabListModule {}
