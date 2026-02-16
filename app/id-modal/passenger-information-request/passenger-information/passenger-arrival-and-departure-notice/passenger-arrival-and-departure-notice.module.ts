import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StaticMsgModule, StaticMsgPipe } from '@lib/pipes';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  InputModule,
  RadiobuttonModule,
  CheckboxModule,
  ButtonModule,
  SelectModule,
  TextTooltipModule,
} from '@lib/components';
import { PassengerInformationRequestPassengerArrivalAndDepartureNoticeComponent } from './passenger-arrival-and-departure-notice.component';
import { PassengerInformationRequestPassengerArrivalAndDepartureNoticeService } from './passenger-arrival-and-departure-notice.service';
@NgModule({
  declarations: [PassengerInformationRequestPassengerArrivalAndDepartureNoticeComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InputModule,
    RadiobuttonModule,
    CheckboxModule,
    ButtonModule,
    SelectModule,
    TextTooltipModule,
    StaticMsgModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: [PassengerInformationRequestPassengerArrivalAndDepartureNoticeComponent],
  providers: [StaticMsgPipe, PassengerInformationRequestPassengerArrivalAndDepartureNoticeService],
})
export class PassengerInformationRequestPassengerArrivalAndDepartureNoticeModule {}
