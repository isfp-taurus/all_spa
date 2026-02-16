import { NgModule } from '@angular/core';
import { SearchFlightHistoryStoreModule } from '@common/store/search-flight-history';
import { SearchApiService } from 'src/sdk-search/api/search-api.service';
import { HistoryFavoriteStoreModule } from '../../../api-store/sdk-search/history-favorite-store/history-favorite-store.module';
import { SearchFlightHistoryStoreService } from './search-flight-history-store.service';
import { SearchFlightHistoryModalStoreModule } from '@common/store/search-flight-history-modal';

@NgModule({
  imports: [SearchFlightHistoryStoreModule, SearchFlightHistoryModalStoreModule, HistoryFavoriteStoreModule],
  providers: [SearchFlightHistoryStoreService, SearchApiService],
})
export class SearchFlightHistoryStoreServiceModule {}
