import { NgModule } from '@angular/core';
import { DeletePrebookedOrderStoreModule } from '../../../../store/delete-prebooked-order';
import { EffectsModule } from '@ngrx/effects';
import { DeletePrebookedOrderStoreService } from './delete-prebooked-order-store.service';

@NgModule({
  providers: [DeletePrebookedOrderStoreService],
  imports: [DeletePrebookedOrderStoreModule, EffectsModule.forRoot()],
})
export class DeletePrebookedOrderStoreServiceModule {}
