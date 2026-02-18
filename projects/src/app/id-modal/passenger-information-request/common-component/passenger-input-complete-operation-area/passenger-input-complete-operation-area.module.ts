import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StaticMsgModule, StaticMsgPipe } from '@lib/pipes';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonLibModule } from '@lib/services';
import { PassengerInformationRequestInputCompleteOperationComponent } from './passenger-input-complete-operation-area.component';
import { ButtonModule, InputModule } from '@lib/components';

@NgModule({
  declarations: [PassengerInformationRequestInputCompleteOperationComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    StaticMsgModule,
    CommonLibModule,
    //部品
    ButtonModule,
    InputModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: [PassengerInformationRequestInputCompleteOperationComponent],
  providers: [StaticMsgPipe],
})
export class PassengerInformationRequestInputCompleteOperationModule {}
