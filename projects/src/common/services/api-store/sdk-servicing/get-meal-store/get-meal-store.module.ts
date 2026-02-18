import { NgModule } from '@angular/core';
import { GetMealStoreModule } from '@common/store/get-meal';
import { EffectsModule } from '@ngrx/effects';
import { GetMealStoreService } from './get-meal-store.service';

@NgModule({
  providers: [GetMealStoreService],
  imports: [GetMealStoreModule, EffectsModule.forRoot()],
})
export class GetMealStoreServiceModule {}
