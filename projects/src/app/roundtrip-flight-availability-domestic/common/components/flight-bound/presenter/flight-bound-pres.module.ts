import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlightBoundPresComponent } from './flight-bound-pres.component';
import { DeviceIfDirectiveModule } from '../../../../common/directives';
import { StaticMsgModule } from '@lib/pipes';
import { TextTooltipModule } from '@lib/components';
import { FareFamilyHeaderContModule } from '../../fare-family-header/fare-family-header-cont.module';
import { VacantSeatItemContModule } from '../../vacant-seat-item/container/vacant-seat-item-cont.module';
import { FlightBoundHeadingPresModule } from '../../flight-bound-heading/flight-bound-heading-pres.module';
import { FlightBoundSelectedContModule } from '../../flight-bound-selected/container/flight-bound-selected-cont.module';
import { ResultDateNaviContModule } from '../../result-date-navi/container/result-date-navi-cont.module';

/**
 * バウンドリストPresModule
 */
@NgModule({
  declarations: [FlightBoundPresComponent],
  imports: [
    CommonModule,
    FareFamilyHeaderContModule,
    VacantSeatItemContModule,
    FlightBoundHeadingPresModule,
    FlightBoundSelectedContModule,
    DeviceIfDirectiveModule,
    StaticMsgModule,
    ResultDateNaviContModule,
    TextTooltipModule,
  ],
  exports: [FlightBoundPresComponent],
})
export class FlightBoundPresModule {}
