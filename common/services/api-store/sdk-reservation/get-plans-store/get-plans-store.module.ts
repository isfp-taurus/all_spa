import { NgModule } from '@angular/core';
import { GetPlansStoreModule } from '@common/store/get-plans';
import { EffectsModule } from '@ngrx/effects';
import { GetPlansStoreService } from './get-plans-store.service';

@NgModule({
  providers: [GetPlansStoreService],
  imports: [GetPlansStoreModule, EffectsModule.forRoot()],
})
export class GetPlansStoreServiceModule {}
