import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StaticMsgModule, StaticMsgPipe } from '@lib/pipes';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputModule, RadiobuttonModule, CheckboxModule, ButtonModule, SelectModule } from '@lib/components';
import { PassengerInformationRequestPassengerFFPComponent } from './passenger-ffp.component';
import { PassengerInformationRequestPassengerFFPService } from './passenger-ffp.service';
@NgModule({
  declarations: [PassengerInformationRequestPassengerFFPComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InputModule,
    RadiobuttonModule,
    CheckboxModule,
    ButtonModule,
    SelectModule,
    StaticMsgModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: [PassengerInformationRequestPassengerFFPComponent],
  providers: [StaticMsgPipe, PassengerInformationRequestPassengerFFPService],
})
export class PassengerInformationRequestPassengerFFPModule {}
