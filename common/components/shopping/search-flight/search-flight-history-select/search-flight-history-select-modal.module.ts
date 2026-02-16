import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchFlightHistoryStoreServiceModule } from '@common/services/store/search-flight/search-flight-history-store/search-flight-history-store.module';
import { SearchFlightHistoryStoreService } from '@common/services/store/search-flight/search-flight-history-store/search-flight-history-store.service';
import { TranslateModule } from '@ngx-translate/core';
import { SearchFlightHistorySelectModalItemModule } from './search-flight-history-select-modal-item/search-flight-history-select-modal-item.module';
import { SearchFlightHistorySelectModalComponent } from './search-flight-history-select-modal.component';
import { StaticMsgModule } from '@lib/pipes';
import { HistoryFavoriteStoreModule } from '@common/services/api-store/sdk-search/history-favorite-store/history-favorite-store.module';
import { SearchFlightRulesLoaddingModule } from '../search-flight-rules-loading/search-flight-rules-loadding.module';
import { FavoritePostStoreServiceModule } from '@common/services/api-store/sdk-search/favorite-post/favorite-post-store.module';
import { HistoryFavoriteDeleteStoreServiceModule } from '@common/services/api-store/sdk-search/history-favorite-delete-store/history-favorite-delete-store.module';
import { ShoppingLibService } from '@common/services/shopping/shopping-lib/shopping-lib.service';
import { ThrottleClickDirectiveModule } from '@lib/directives';

@NgModule({
  declarations: [SearchFlightHistorySelectModalComponent],
  imports: [
    CommonModule,
    SearchFlightHistoryStoreServiceModule,
    FavoritePostStoreServiceModule,
    HistoryFavoriteDeleteStoreServiceModule,
    SearchFlightHistorySelectModalItemModule,
    TranslateModule,
    StaticMsgModule,
    HistoryFavoriteStoreModule,
    SearchFlightRulesLoaddingModule,
    ThrottleClickDirectiveModule,
  ],
  exports: [SearchFlightHistorySelectModalComponent],
  providers: [SearchFlightHistoryStoreService, ShoppingLibService],
})
export class SearchFlightHistorySelectModalModule {}
