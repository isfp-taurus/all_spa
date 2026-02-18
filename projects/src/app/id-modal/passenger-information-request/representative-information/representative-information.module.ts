import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StaticMsgModule, StaticMsgPipe } from '@lib/pipes';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonLibModule } from '@lib/services';
import { PassengerInformationRequestRepresentativeInformationComponent } from './representative-information.component';
import { PassengerInformationRequestRepresentativeInformationService } from './representative-information.service';
import {
  SelectDateYmdModule,
  ButtonModule,
  InputModule,
  RadiobuttonBoxModule,
  SelectModule,
  TextTooltipModule,
} from '@lib/components';
import { PassengerInformationRequestInputCompleteOperationModule } from '../common-component/passenger-input-complete-operation-area/passenger-input-complete-operation-area.module';

@NgModule({
  declarations: [PassengerInformationRequestRepresentativeInformationComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    StaticMsgModule,
    CommonLibModule,
    //部品
    SelectDateYmdModule,
    ButtonModule,
    InputModule,
    SelectModule,
    RadiobuttonBoxModule,
    TextTooltipModule,
    //サブコンポーネント
    PassengerInformationRequestInputCompleteOperationModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: [PassengerInformationRequestRepresentativeInformationComponent],
  providers: [StaticMsgPipe, PassengerInformationRequestRepresentativeInformationService],
})
export class PassengerInformationRequestRepresentativeInformationModule {}
