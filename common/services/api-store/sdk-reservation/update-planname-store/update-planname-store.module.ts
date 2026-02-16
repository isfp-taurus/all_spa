import { NgModule } from '@angular/core';
import { UpdatePlannameStoreModule } from '@common/store/update-planname';
import { EffectsModule } from '@ngrx/effects';
import { UpdatePlannameStoreService } from './update-planname-store.service';

@NgModule({
  providers: [UpdatePlannameStoreService],
  imports: [UpdatePlannameStoreModule, EffectsModule.forRoot()],
})
export class UpdatePlannameStoreServiceModule {}
