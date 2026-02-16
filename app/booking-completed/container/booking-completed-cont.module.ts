import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingCompletedPresModule } from '../presenter/booking-completed-pres.module';
import { BookingCompletedContComponent } from './booking-completed-cont.component';
import { RouterModule } from '@angular/router';
import { GetOrderStoreServiceModule } from '@common/services/api-store/sdk-servicing/get-order-store/get-order-store.module';
import { FareConditionsStoreServiceModule } from '@common/services/api-store/sdk-servicing/fare-conditions-store/fare-conditions-store.module';
import { DeliveryInformationStoreServiceModule } from '@common/services/store/common/delivery-information-store/delivery-information-store.module';
import { TranslateModule } from '@ngx-translate/core';
import {
  BookingCompletedSubHeaderInformationStoreServiceModule,
  GetETicketItineraryReceiptStoreServiceModule,
} from '@common/services';
import { LinkUrlModule, LinkUrlPipe, StaticMsgModule, StaticMsgPipe } from '@lib/pipes';
import { BookingCompletedContService } from './booking-completed-cont.service';

/**
 * 予約・購入完了ContModule
 */
@NgModule({
  declarations: [BookingCompletedContComponent],
  imports: [
    RouterModule.forChild([{ path: '', component: BookingCompletedContComponent }]),
    CommonModule,
    BookingCompletedPresModule,
    GetOrderStoreServiceModule,
    FareConditionsStoreServiceModule,
    DeliveryInformationStoreServiceModule,
    TranslateModule,
    BookingCompletedSubHeaderInformationStoreServiceModule,
    StaticMsgModule,
    GetETicketItineraryReceiptStoreServiceModule,
    LinkUrlModule,
  ],
  exports: [BookingCompletedContComponent],
  providers: [BookingCompletedContService, StaticMsgPipe, LinkUrlPipe],
})
export class BookingCompletedContModule {}
