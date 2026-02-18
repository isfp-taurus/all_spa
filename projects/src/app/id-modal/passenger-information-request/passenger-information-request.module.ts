import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PassengerInformationRequestComponent } from './passenger-information-request.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CancelPrebookServiceModule } from '@common/services/cancel-prebook/cancel-prebook.module';
import { LocalPlanServiceModule } from '@common/services/local-plan/local-plan.module';
import { StaticMsgModule, StaticMsgPipe } from '@lib/pipes';
import {
  CreateOrderStoreServiceModule,
  CurrentCartStoreServiceModule,
  CurrentPlanStoreServiceModule,
  DeletePrebookedOrderStoreServiceModule,
  DeliveryInformationStoreServiceModule,
  GetCartStoreServiceModule,
  GetOrderStoreServiceModule,
  GetPlansStoreServiceModule,
  PlanReviewStoreServiceModule,
  SupportInformationInputStoreServiceModule,
  UpdateTravelersStoreServiceModule,
} from '@common/services';
import { PassengerInformationRequestHeaderComponent } from './passenger-information-request-header.component';
import { PassengerInformationRequestFooterComponent } from './passenger-information-request-footer.component';
import { PassengerInformationRequestService } from './passenger-information-request.service';
import { AswMasterStoreModule, SysdateStoreModule } from '@lib/store';
import { CommonLibModule, DialogDisplayServiceModule, ModalServiceModule } from '@lib/services';
import { PassengerInformationRequestApiService } from './passenger-information-request-api.service';
import { SelectNextPageModalModule } from './modal/select-next-page-modal/select-next-page-modal.module';
import { SupportInformationInputModule } from './modal/support-information-input/support-information-input.module';
import { PassengerInformationRequestPassengerInformationModule } from './passenger-information/passenger-information.module';
import { PassengerInformationRequestRepresentativeInformationModule } from './representative-information/representative-information.module';
import { ThrottleClickDirectiveModule } from '@lib/directives';

@NgModule({
  declarations: [
    PassengerInformationRequestComponent,
    PassengerInformationRequestHeaderComponent,
    PassengerInformationRequestFooterComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    CancelPrebookServiceModule,
    CreateOrderStoreServiceModule,
    CurrentCartStoreServiceModule,
    CurrentPlanStoreServiceModule,
    DeletePrebookedOrderStoreServiceModule,
    DeliveryInformationStoreServiceModule,
    GetCartStoreServiceModule,
    GetOrderStoreServiceModule,
    GetPlansStoreServiceModule,
    PlanReviewStoreServiceModule,
    LocalPlanServiceModule,
    DialogDisplayServiceModule,
    AswMasterStoreModule,
    PlanReviewStoreServiceModule,
    SupportInformationInputStoreServiceModule,

    UpdateTravelersStoreServiceModule,
    CancelPrebookServiceModule,
    StaticMsgModule,
    CommonLibModule,
    ModalServiceModule,
    SysdateStoreModule,
    ThrottleClickDirectiveModule,

    //サブコンポーネント
    PassengerInformationRequestPassengerInformationModule,
    PassengerInformationRequestRepresentativeInformationModule,
    //サブコンポーネント モーダル
    SupportInformationInputModule,
    SelectNextPageModalModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [StaticMsgPipe, PassengerInformationRequestService, PassengerInformationRequestApiService],
})
export class PassengerInformationRequestModule {}
