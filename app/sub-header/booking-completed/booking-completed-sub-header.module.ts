import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BookingCompletedSubHeaderInformationStoreServiceModule } from '@common/services';
import { BookingCompletedSubHeaderComponent } from './booking-completed-sub-header.component';
import { TranslateModule } from '@ngx-translate/core';
import { StaticMsgModule } from '@lib/pipes';

@NgModule({
  declarations: [BookingCompletedSubHeaderComponent],
  imports: [CommonModule, BookingCompletedSubHeaderInformationStoreServiceModule, TranslateModule, StaticMsgModule],
  exports: [BookingCompletedSubHeaderComponent],
})
export class BookingCompletedSubHeaderModule {}
