import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StaticMsgModule, StaticMsgPipe } from '@lib/pipes';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputModule, RadiobuttonModule, CheckboxModule, ButtonModule, SelectModule } from '@lib/components';
import { PassengerInformationRequestPassengerCloseHeaderComponent } from './passenger-header-close.component';
import { PassengerInformationRequestPassengerCloseHeaderService } from './passenger-header-close.service';
@NgModule({
  declarations: [PassengerInformationRequestPassengerCloseHeaderComponent],
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
  exports: [PassengerInformationRequestPassengerCloseHeaderComponent],
  providers: [StaticMsgPipe, PassengerInformationRequestPassengerCloseHeaderService],
})
export class PassengerInformationRequestPassengerCloseHeaderModule {}
