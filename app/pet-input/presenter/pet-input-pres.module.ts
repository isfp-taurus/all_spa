import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PetInputPresComponent } from './pet-input-pres.component';
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
import {
  AgreementAreaModule,
  InputModule,
  RadiobuttonModule,
  SelectModule,
  ValidationErrorModule,
} from '@lib/components';
import { PetInfoInputModule } from '../sub-components/pet-info-input/pet-info-input.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CartsUpdatePetRakunoriStoreServiceModule } from '@common/services/api-store/sdk-reservation/carts-update-pet-rakunori-store/carts-update-pet-rakunori-store.module';

/**
 * ペットらくのりPresModule
 */
@NgModule({
  declarations: [PetInputPresComponent],
  imports: [
    ValidationErrorModule,
    PetInfoInputModule,
    RadiobuttonModule,
    SelectModule,
    AgreementAreaModule,
    CommonModule,
    GetOrderStoreServiceModule,
    FareConditionsStoreServiceModule,
    DeliveryInformationStoreServiceModule,
    TranslateModule,
    BookingCompletedSubHeaderInformationStoreServiceModule,
    StaticMsgModule,
    GetETicketItineraryReceiptStoreServiceModule,
    PetInputStoreServiceModule,
    FormsModule,
    ReactiveFormsModule,
    CartsUpdatePetRakunoriStoreServiceModule,
    InputModule,
  ],
  exports: [PetInputPresComponent],
  providers: [StaticMsgPipe],
})
export class PetInputPresModule {}
