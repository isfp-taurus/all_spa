import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { HistoryFavoriteDeleteStoreModule } from '@common/store/history-favorite-delete';
import { HistoryFavoriteDeleteStoreService } from './history-favorite-delete-store.service';

@NgModule({
  imports: [HistoryFavoriteDeleteStoreModule, EffectsModule.forRoot()],
  providers: [HistoryFavoriteDeleteStoreService],
})
export class HistoryFavoriteDeleteStoreServiceModule {}
