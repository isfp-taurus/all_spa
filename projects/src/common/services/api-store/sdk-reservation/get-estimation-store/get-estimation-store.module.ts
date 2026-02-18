import { NgModule } from '@angular/core';
import { GetEstimationStoreModule } from '@common/store/get-estimation';
import { EffectsModule } from '@ngrx/effects';
import { GetEstimationStoreService } from './get-estimation-store.service';

@NgModule({
  providers: [GetEstimationStoreService],
  imports: [GetEstimationStoreModule, EffectsModule.forRoot()],
})
export class GetEstimationStoreServiceModule {}
