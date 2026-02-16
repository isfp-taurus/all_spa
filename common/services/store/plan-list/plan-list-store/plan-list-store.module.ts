import { NgModule } from '@angular/core';
import { PlanListStoreModule } from '@common/store';
import { EffectsModule } from '@ngrx/effects';
import { PlanListStoreService } from './plan-list-store.service';

@NgModule({
  providers: [PlanListStoreService],
  imports: [PlanListStoreModule, EffectsModule.forRoot()],
})
export class PlanListStoreServiceModule {}
