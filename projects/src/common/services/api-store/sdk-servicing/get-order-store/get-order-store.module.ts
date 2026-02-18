import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { GetOrderStoreModule } from '../../../../store/get-order';
import { GetOrderStoreService } from './get-order-store.service';

@NgModule({
  providers: [GetOrderStoreService],
  imports: [GetOrderStoreModule, EffectsModule.forRoot()],
})
export class GetOrderStoreServiceModule {}
