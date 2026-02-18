import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchFlightHistoryStoreServiceModule } from '@common/services/store/search-flight/search-flight-history-store/search-flight-history-store.module';
import { SearchFlightHistorySelectModalService } from '@common/components/shopping/search-flight/search-flight-history-select/search-flight-history-select-modal.service';
import { TranslateModule } from '@ngx-translate/core';
import { SearchFlightSubHeaderComponent } from './search-flight-sub-header.component';
import { SearchFlightHistorySelectModalModule } from '@common/components/shopping/search-flight/search-flight-history-select/search-flight-history-select-modal.module';
import { StaticMsgModule } from '@lib/pipes';
import { ThrottleClickDirectiveModule } from '@lib/directives';

@NgModule({
  declarations: [SearchFlightSubHeaderComponent],
  imports: [
    CommonModule,
    TranslateModule,
    SearchFlightHistorySelectModalModule,
    StaticMsgModule,
    ThrottleClickDirectiveModule,
  ],
  exports: [SearchFlightSubHeaderComponent],
  providers: [SearchFlightHistorySelectModalService, SearchFlightHistoryStoreServiceModule],
})
export class SearchFlightSubHeaderModule {}
