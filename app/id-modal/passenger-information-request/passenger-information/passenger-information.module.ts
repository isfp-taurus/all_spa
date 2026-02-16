import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StaticMsgModule, StaticMsgPipe } from '@lib/pipes';
import { PassengerInformationRequestPassengerInformationComponent } from './passenger-information.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  InputModule,
  RadiobuttonModule,
  CheckboxModule,
  ButtonModule,
  SelectModule,
  SelectDateYmdModule,
} from '@lib/components';
import { TranslateModule } from '@ngx-translate/core';
import { PassengerInformationRequestPassengerInfoService } from './passenger-information.service';
import { PassengerInformationRequestInputCompleteOperationModule } from '../common-component/passenger-input-complete-operation-area/passenger-input-complete-operation-area.module';
import { PassengerInformationRequestPassengerArrivalAndDepartureNoticeModule } from './passenger-arrival-and-departure-notice/passenger-arrival-and-departure-notice.module';
import { PassengerInformationRequestPassengerBasicInformationModule } from './passenger-basic-information/passenger-basic-information.module';
import { PassengerInformationRequestPassengerContactModule } from './passenger-contact/passenger-contact.module';
import { PassengerInformationRequestPassengerFFPModule } from './passenger-ffp/passenger-ffp.module';
import { PassengerInformationRequestPassengerCloseHeaderModule } from './passenger-header-close/passenger-header-close.module';
import { PassengerInformationRequestPassengerOpenHeaderModule } from './passenger-header-open/passenger-header-open.module';
import { PassengerInformationRequestPassengerPassportModule } from './passenger-passport/passenger-passport.module';
import { PassengerInformationRequestPassengerSupportModule } from './passenger-support/passenger-support.module';
import { PassengerInformationRequestDisabilityDiscountModule } from './passenger-disability-discount/passenger-disability-discount.module';
import { PassengerInformationRequestIslandCardModule } from './passenger-island-card/passenger-island-card.module';

@NgModule({
  declarations: [PassengerInformationRequestPassengerInformationComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InputModule,
    RadiobuttonModule,
    CheckboxModule,
    ButtonModule,
    TranslateModule,
    SelectModule,
    StaticMsgModule,
    //部品
    SelectDateYmdModule,
    ButtonModule,
    InputModule,
    //サブコンポーネント
    PassengerInformationRequestInputCompleteOperationModule,
    PassengerInformationRequestPassengerOpenHeaderModule,
    PassengerInformationRequestPassengerCloseHeaderModule,
    PassengerInformationRequestPassengerBasicInformationModule,
    PassengerInformationRequestPassengerPassportModule,
    PassengerInformationRequestPassengerFFPModule,
    PassengerInformationRequestPassengerContactModule,
    PassengerInformationRequestPassengerArrivalAndDepartureNoticeModule,
    PassengerInformationRequestPassengerSupportModule,
    //FY25
    PassengerInformationRequestDisabilityDiscountModule,
    PassengerInformationRequestIslandCardModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: [PassengerInformationRequestPassengerInformationComponent],
  providers: [StaticMsgPipe, PassengerInformationRequestPassengerInfoService],
})
export class PassengerInformationRequestPassengerInformationModule {}
