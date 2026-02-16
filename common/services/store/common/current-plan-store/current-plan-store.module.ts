import { NgModule } from '@angular/core';
import { CurrentPlanStoreModule } from '@common/store/current-plan';
import { EffectsModule } from '@ngrx/effects';
import { CurrentPlanStoreService } from './current-plan-store.service';

@NgModule({
  providers: [CurrentPlanStoreService],
  imports: [CurrentPlanStoreModule, EffectsModule.forRoot()],
})
export class CurrentPlanStoreServiceModule {}
