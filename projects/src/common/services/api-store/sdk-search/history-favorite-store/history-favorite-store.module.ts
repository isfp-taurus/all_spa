import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HistoryFavoriteStoreService } from './history-favorite-store.service';
import { HistoryFavoriteGetStoreModule } from '@common/store/history-favorite-get';
import { HistoryFavoriteGetShowStoreModule } from '@common/store/history-favorite-get-show';

@NgModule({
  declarations: [],
  imports: [CommonModule, HistoryFavoriteGetStoreModule, HistoryFavoriteGetShowStoreModule],
  providers: [HistoryFavoriteStoreService],
})
export class HistoryFavoriteStoreModule {}
