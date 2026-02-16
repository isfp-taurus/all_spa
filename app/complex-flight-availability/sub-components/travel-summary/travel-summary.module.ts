import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { TravelSummaryComponent } from './travel-summary.component';
import { AmountFormatModule, DateFormatModule, StaticMsgModule } from '@lib/pipes';

@NgModule({
  declarations: [TravelSummaryComponent],
  imports: [CommonModule, TranslateModule, StaticMsgModule, DateFormatModule, AmountFormatModule],
  exports: [TravelSummaryComponent],
  providers: [],
})
export class TravelSummaryModule {}
