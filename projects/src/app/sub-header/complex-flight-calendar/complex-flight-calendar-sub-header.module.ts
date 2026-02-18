import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ComplexFlightCalendarSubHeaderComponent } from './complex-flight-calendar-sub-header.component';
import { ComplexFlightCalendarStoreServiceModule } from '@common/services';
import { StaticMsgModule } from '@lib/pipes';
import { ThrottleClickDirectiveModule } from '@lib/directives';
@NgModule({
  declarations: [ComplexFlightCalendarSubHeaderComponent],
  imports: [
    CommonModule,
    TranslateModule,
    ComplexFlightCalendarStoreServiceModule,
    StaticMsgModule,
    ThrottleClickDirectiveModule,
  ],
  exports: [ComplexFlightCalendarSubHeaderComponent],
})
export class ComplexFlightCalendarSubHeaderModule {}
