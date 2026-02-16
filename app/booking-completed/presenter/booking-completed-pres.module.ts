import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingCompletedPresComponent } from './booking-completed-pres.component';
import { GetOrderStoreServiceModule, SearchFlightStoreServiceModule } from '@common/services';
import { TranslateModule } from '@ngx-translate/core';
import { StaticMsgModule } from '@lib/pipes';
import { MybookingBaggageRulesModule } from '@common/components/servicing/mybooking/mybooking-baggage-rules/mybooking-baggage-rules.module';
import { AswMasterStoreModule } from '@lib/store';
import { NextActionModule } from '@common/components/reservation/next-action/next-action.module';
import { BookingCompletedButtonAreaModule } from '../sub-component/booking-completed-button-area/booking-completed-button-area.module';
import { BookingCompletedCriteoModule } from '../sub-component/booking-completed-criteo/booking-completed-criteo.module';
import { BookingCompletedPresService } from './booking-completed-pres.service';
import { ThrottleClickDirectiveModule } from '@lib/directives';

/**
 * 予約・購入完了PresModule
 */
@NgModule({
  declarations: [BookingCompletedPresComponent],
  imports: [
    CommonModule,
    GetOrderStoreServiceModule,
    TranslateModule,
    NextActionModule,
    StaticMsgModule,
    MybookingBaggageRulesModule,
    AswMasterStoreModule,
    BookingCompletedButtonAreaModule,
    BookingCompletedCriteoModule,
    SearchFlightStoreServiceModule,
    ThrottleClickDirectiveModule,
  ],
  providers: [BookingCompletedPresService],
  exports: [BookingCompletedPresComponent],
})
export class BookingCompletedPresModule {}
