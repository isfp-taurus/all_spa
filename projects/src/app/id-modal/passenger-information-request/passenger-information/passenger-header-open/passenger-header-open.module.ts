import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StaticMsgModule, StaticMsgPipe } from '@lib/pipes';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputModule, RadiobuttonModule, CheckboxModule, ButtonModule, SelectModule } from '@lib/components';
import { PassengerInformationRequestPassengerOpenHeaderComponent } from './passenger-header-open.component';
import { PassengerInformationRequestPassengerOpenHeaderService } from './passenger-header-open.service';
@NgModule({
  declarations: [PassengerInformationRequestPassengerOpenHeaderComponent],
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
  exports: [PassengerInformationRequestPassengerOpenHeaderComponent],
  providers: [StaticMsgPipe, PassengerInformationRequestPassengerOpenHeaderService],
})
export class PassengerInformationRequestPassengerOpenHeaderModule {}
