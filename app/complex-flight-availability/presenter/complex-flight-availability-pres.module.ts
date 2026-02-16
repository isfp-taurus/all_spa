import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ModalModule } from '@lib/components';
import { FooterModule } from '../sub-components/footer/footer.module';
import { FareOptionModule } from '../sub-components/fare-option/fare-option.module';
import { FarePanelSelectModule } from '../sub-components/fare-panel-select/fare-panel-select.module';
import { FlightBoundModule } from '../sub-components/flight-bound/flight-bound.module';
import { ComplexFlightAvailabilityPresComponent } from './complex-flight-availability-pres.component';
import { TravelSummaryModule } from '../sub-components/travel-summary/travel-summary.module';
import { DateFormatModule, StaticMsgModule } from '@lib/pipes';
import { FlightDetailModule } from '@common/components/shopping/flight-detail/flight-detail.module';
import { FlightDetailModalService } from '@common/components/shopping/flight-detail/flight-detail-modal.service';
import { DataAdapterService } from '../service/data-adapter.service';

@NgModule({
  declarations: [ComplexFlightAvailabilityPresComponent],
  imports: [
    CommonModule,
    ModalModule,
    FarePanelSelectModule,
    FlightBoundModule,
    FareOptionModule,
    FooterModule,
    FarePanelSelectModule,
    TravelSummaryModule,
    StaticMsgModule,
    FlightDetailModule,
    DateFormatModule,
  ],
  exports: [ComplexFlightAvailabilityPresComponent],
  providers: [FlightDetailModalService, DataAdapterService],
})
export class ComplexFlightAvailabilityPresModule {}
