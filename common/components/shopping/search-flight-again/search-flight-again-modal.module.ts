import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchFlightAgainModalComponent } from './search-flight-again-modal.component';
import { SearchFlightBodyContModule } from '@common/components/shopping/search-flight/search-flight-body/container/search-flight-body-cont.module';
import { TranslateModule } from '@ngx-translate/core';
import { StaticMsgModule } from '@lib/pipes';
import { ThrottleClickDirectiveModule } from '@lib/directives';

@NgModule({
  declarations: [SearchFlightAgainModalComponent],
  imports: [CommonModule, TranslateModule, SearchFlightBodyContModule, StaticMsgModule, ThrottleClickDirectiveModule],
  exports: [SearchFlightAgainModalComponent],
})
export class SearchFlightAgainModalModule {}
