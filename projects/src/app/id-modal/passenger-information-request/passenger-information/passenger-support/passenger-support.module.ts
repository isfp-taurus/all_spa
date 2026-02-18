import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DateFormatModule, StaticMsgModule, StaticMsgPipe } from '@lib/pipes';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  InputModule,
  RadiobuttonModule,
  CheckboxModule,
  ButtonModule,
  SelectModule,
  TextTooltipModule,
} from '@lib/components';
import { PassengerInformationRequestPassengerSupportComponent } from './passenger-support.component';
import { PassengerInformationRequestPassengerSupportService } from './passenger-support.service';
import { SupportInformationInputStoreServiceModule } from '@common/services';
import { ModalServiceModule } from '@lib/services';
@NgModule({
  declarations: [PassengerInformationRequestPassengerSupportComponent],
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
    ModalServiceModule,
    SupportInformationInputStoreServiceModule,
    DateFormatModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: [PassengerInformationRequestPassengerSupportComponent],
  providers: [StaticMsgPipe, PassengerInformationRequestPassengerSupportService],
})
export class PassengerInformationRequestPassengerSupportModule {}
