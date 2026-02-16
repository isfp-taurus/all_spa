import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { HistoryStoreModule } from '@common/store/history';
import { HistoryService } from './history-store.service';

@NgModule({
  providers: [HistoryService],
  imports: [HistoryStoreModule, EffectsModule.forRoot()],
})
export class HistoryStoreServiceModule {}
