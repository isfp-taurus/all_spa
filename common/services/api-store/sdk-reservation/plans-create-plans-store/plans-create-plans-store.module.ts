import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { PlansCreatePlansStoreModule } from '@common/store/plans-create-plans';
import { PlansCreatePlansStoreService } from './plans-create-plans-store.service';

@NgModule({
  providers: [PlansCreatePlansStoreService],
  imports: [PlansCreatePlansStoreModule, EffectsModule.forRoot()],
})
export class PlansCreatePlansStoreServiceModule {}
