import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PetInputPresModule } from '../presenter/pet-input-pres.module';
import { PetInputContComponent } from './pet-input-cont.component';
import { RouterModule } from '@angular/router';
import { GetOrderStoreServiceModule } from '@common/services/api-store/sdk-servicing/get-order-store/get-order-store.module';
import { FareConditionsStoreServiceModule } from '@common/services/api-store/sdk-servicing/fare-conditions-store/fare-conditions-store.module';
import { DeliveryInformationStoreServiceModule } from '@common/services/store/common/delivery-information-store/delivery-information-store.module';
import { TranslateModule } from '@ngx-translate/core';
import {
  BookingCompletedSubHeaderInformationStoreServiceModule,
  GetETicketItineraryReceiptStoreServiceModule,
  PetInputStoreServiceModule,
} from '@common/services';
import { StaticMsgModule, StaticMsgPipe } from '@lib/pipes';

/**
 * ペットらくのりContModule
 */
@NgModule({
  declarations: [PetInputContComponent],
  imports: [
    RouterModule.forChild([{ path: '', component: PetInputContComponent }]),
    CommonModule,
    PetInputPresModule,
    GetOrderStoreServiceModule,
    FareConditionsStoreServiceModule,
    DeliveryInformationStoreServiceModule,
    TranslateModule,
    BookingCompletedSubHeaderInformationStoreServiceModule,
    StaticMsgModule,
    GetETicketItineraryReceiptStoreServiceModule,
    PetInputStoreServiceModule,
  ],
  exports: [PetInputContComponent],
  providers: [StaticMsgPipe],
})
export class PetInputContModule {}
