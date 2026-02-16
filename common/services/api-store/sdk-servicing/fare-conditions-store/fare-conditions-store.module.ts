import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { FareConditionsStoreModule } from '../../../../store/fare-conditions';
import { FareConditionsStoreService } from './fare-conditions-store.service';

@NgModule({
  providers: [FareConditionsStoreService],
  imports: [FareConditionsStoreModule, EffectsModule.forRoot()],
})
export class FareConditionsStoreServiceModule {}
