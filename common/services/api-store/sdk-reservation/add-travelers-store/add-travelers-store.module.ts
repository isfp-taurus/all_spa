import { NgModule } from '@angular/core';
import { AddTravelersStoreModule } from '../../../../store/add-travelers';
import { EffectsModule } from '@ngrx/effects';
import { AddTravelersStoreService } from './add-travelers-store.service';

@NgModule({
  providers: [AddTravelersStoreService],
  imports: [AddTravelersStoreModule, EffectsModule.forRoot()],
})
export class AddTravelersStoreServiceModule {}
