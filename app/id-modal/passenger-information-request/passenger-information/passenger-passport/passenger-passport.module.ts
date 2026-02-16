import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StaticMsgModule, StaticMsgPipe } from '@lib/pipes';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputModule, RadiobuttonModule, CheckboxModule, ButtonModule, SelectModule } from '@lib/components';
import { PassengerInformationRequestPassengerPassportComponent } from './passenger-passport.component';
import { PassengerInformationRequestPassengerPassportService } from './passenger-passport.service';
@NgModule({
  declarations: [PassengerInformationRequestPassengerPassportComponent],
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
  exports: [PassengerInformationRequestPassengerPassportComponent],
  providers: [StaticMsgPipe, PassengerInformationRequestPassengerPassportService],
})
export class PassengerInformationRequestPassengerPassportModule {}
