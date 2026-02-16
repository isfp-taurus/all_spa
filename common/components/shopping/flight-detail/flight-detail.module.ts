import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { AmountFormatModule, DateFormatModule, MetaUrlModule } from '@lib/pipes';
import { FlightDetailComponent } from './flight-detail.component';
import { MyBookingStoreServiceModule } from '@common/services/myBooking-store/myBooking-store.module';
import { StaticMsgModule } from '@lib/pipes';
import { TextTooltipModule } from '../../../../lib/components/base-ui-components/tooltip/tooltip.module';

@NgModule({
  declarations: [FlightDetailComponent],
  imports: [
    CommonModule,
    StaticMsgModule,
    AmountFormatModule,
    DateFormatModule,
    MyBookingStoreServiceModule,
    MetaUrlModule,
    TextTooltipModule,
  ],
  exports: [FlightDetailComponent],
  providers: [DatePipe],
})
export class FlightDetailModule {}
