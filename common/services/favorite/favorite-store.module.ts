import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { FavoriteStoreModule } from '@common/store/favorite';
import { FavoriteService } from './favorite-store.service';

@NgModule({
  providers: [FavoriteService],
  imports: [FavoriteStoreModule, EffectsModule.forRoot()],
})
export class FavoriteStoreServiceModule {}
