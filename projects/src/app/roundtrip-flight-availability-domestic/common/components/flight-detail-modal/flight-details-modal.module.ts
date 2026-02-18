import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlightDetailsModalComponent } from './flight-details-modal.component';
import { BaseModalModule } from '../base-modal/base-modal.module';
import { StaticMsgModule } from '@lib/pipes';
import { FlightDetailsModalService } from './flight-details-modal.service';
import { DateFormatModule } from '@lib/pipes';
import { FlightSelectConnectionContModule } from '../flight-select-connection/container/flight-select-connection-cont.module';
import { FlightSelectListContModule } from '../flight-select-list/container';

/**
 * フライト詳細モーダルModule
 */
@NgModule({
  imports: [
    CommonModule,
    BaseModalModule,
    FlightSelectListContModule,
    StaticMsgModule,
    DateFormatModule,
    FlightSelectConnectionContModule,
  ],
  declarations: [FlightDetailsModalComponent],
  exports: [FlightDetailsModalComponent],
  providers: [FlightDetailsModalService],
})
export class FlightDetailsModalModule {}
