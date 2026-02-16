import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { DeletePlansStoreModule } from '../../../../store/delete-plans';
import { DeletePlansStoreService } from './delete-plans-store.service';

@NgModule({
  providers: [DeletePlansStoreService],
  imports: [DeletePlansStoreModule, EffectsModule.forRoot()],
})
export class DeletePlansStoreServiceModule {}
