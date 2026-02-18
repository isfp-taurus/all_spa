import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StaticMsgModule, StaticMsgPipe } from '@lib/pipes';
import { PassengerInformationRequestIslandCardComponent } from './passenger-island-card.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonLibModule } from '@lib/services';
import { PassengerInformationRequestIslandCardService } from './passenger-island-card.service';
import { InputModule } from '@lib/components';
@NgModule({
  declarations: [PassengerInformationRequestIslandCardComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, StaticMsgModule, CommonLibModule, InputModule],
  exports: [PassengerInformationRequestIslandCardComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [StaticMsgPipe, PassengerInformationRequestIslandCardService],
})
export class PassengerInformationRequestIslandCardModule {}
