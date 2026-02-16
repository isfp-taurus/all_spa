import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { StaticMsgModule } from '@lib/pipes';
import { TranslateModule } from '@ngx-translate/core';
import { FindMoreFlightsSubHeaderComponent } from './find-more-flights-sub-header.component';
import { ThrottleClickDirectiveModule } from '@lib/directives';

@NgModule({
  declarations: [FindMoreFlightsSubHeaderComponent],
  imports: [CommonModule, StaticMsgModule, TranslateModule, ThrottleClickDirectiveModule],
  exports: [FindMoreFlightsSubHeaderComponent],
})
export class FindMoreFlightsSubHeaderModule {}
