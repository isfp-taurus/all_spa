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
  SelectDateYmdModule,
  TextTooltipModule,
} from '@lib/components';
import { PassengerInformationRequestPassengerBasicInformationComponent } from './passenger-basic-information.component';
import { PassengerInformationRequestPassengerBasicInformationService } from './passenger-basic-information.service';
@NgModule({
  declarations: [PassengerInformationRequestPassengerBasicInformationComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InputModule,
    RadiobuttonModule,
    CheckboxModule,
    ButtonModule,
    SelectModule,
    SelectDateYmdModule,
    TextTooltipModule,
    StaticMsgModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: [PassengerInformationRequestPassengerBasicInformationComponent],
  providers: [StaticMsgPipe, PassengerInformationRequestPassengerBasicInformationService],
})
export class PassengerInformationRequestPassengerBasicInformationModule {}
