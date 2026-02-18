import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StaticMsgModule, StaticMsgPipe } from '@lib/pipes';
import { PassengerInformationRequestDisabilityDiscountComponent } from './passenger-disability-discount.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonLibModule } from '@lib/services';
import { PassengerInformationRequestDisabilityDiscountService } from './passenger-disability-discount.service';
import { SelectModule } from '@lib/components';
@NgModule({
  declarations: [PassengerInformationRequestDisabilityDiscountComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, StaticMsgModule, CommonLibModule, SelectModule],
  exports: [PassengerInformationRequestDisabilityDiscountComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [StaticMsgPipe, PassengerInformationRequestDisabilityDiscountService],
})
export class PassengerInformationRequestDisabilityDiscountModule {}
