import { NgModule } from '@angular/core';
import { CreatePlansStoreModule } from '@common/store/create-plans';
import { EffectsModule } from '@ngrx/effects';
import { CreatePlansStoreService } from './create-plans-store.service';

@NgModule({
  providers: [CreatePlansStoreService],
  imports: [CreatePlansStoreModule, EffectsModule.forRoot()],
})
export class CreatePlansStoreServiceModule {}
