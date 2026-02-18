import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { UpdateServicesStoreService } from './update-services-store.service';
import { UpdateServicesStoreModule } from '@common/store/update-services';

@NgModule({
  providers: [UpdateServicesStoreService],
  imports: [UpdateServicesStoreModule, EffectsModule.forRoot()],
})
export class UpdateServicesStoreServiceModule {}
