import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { OtherBookingPassengerModalComponent } from './other-booking-passenger-modal.component';
import { ShoppingLibModule } from '@common/services/shopping/shopping-lib/shopping-lib.module';
import { StaticMsgModule } from '@lib/pipes';
import { OtherBookingPassengerModalService } from './other-booking-passenger-modal.service';
import { CheckboxModule } from '@lib/components';

@NgModule({
  declarations: [OtherBookingPassengerModalComponent],
  imports: [CommonModule, TranslateModule, ReactiveFormsModule, ShoppingLibModule, StaticMsgModule, CheckboxModule],
  exports: [OtherBookingPassengerModalComponent],
  providers: [OtherBookingPassengerModalService],
})
export class OtherBookingPassengerModalModule {}
