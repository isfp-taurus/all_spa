import { NgModule } from '@angular/core';
import { DeleteTravelerStoreModule } from '@common/store/delete-traveler';
import { EffectsModule } from '@ngrx/effects';
import { DeleteTravelerStoreService } from './delete-traveler-store.service';

@NgModule({
  providers: [DeleteTravelerStoreService],
  imports: [DeleteTravelerStoreModule, EffectsModule.forRoot()],
})
export class DeleteTravelerStoreServiceModule {}
