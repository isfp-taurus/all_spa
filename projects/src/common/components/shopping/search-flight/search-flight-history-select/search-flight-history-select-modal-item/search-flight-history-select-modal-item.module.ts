import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { SearchFlightHistorySelectModalItemComponent } from './search-flight-history-select-modal-item.component';
import { StaticMsgModule } from '@lib/pipes';
import { ThrottleClickDirectiveModule } from '@lib/directives';

@NgModule({
  declarations: [SearchFlightHistorySelectModalItemComponent],
  imports: [CommonModule, TranslateModule, StaticMsgModule, ThrottleClickDirectiveModule],
  exports: [SearchFlightHistorySelectModalItemComponent],
})
export class SearchFlightHistorySelectModalItemModule {}
