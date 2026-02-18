import { NgModule } from '@angular/core';
import { FavoritePostStoreModule } from '@common/store/favorite-post';
import { FavoritePostService } from './favorite-post-store.service';

@NgModule({
  providers: [FavoritePostService],
  imports: [FavoritePostStoreModule],
})
export class FavoritePostStoreServiceModule {}
