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
import { PassengerInformationRequestPassengerContactComponent } from './passenger-contact.component';
import { PassengerInformationRequestPassengerContactService } from './passenger-contact.service';
@NgModule({
  declarations: [PassengerInformationRequestPassengerContactComponent],
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
  exports: [PassengerInformationRequestPassengerContactComponent],
  providers: [StaticMsgPipe, PassengerInformationRequestPassengerContactService],
})
export class PassengerInformationRequestPassengerContactModule {}
