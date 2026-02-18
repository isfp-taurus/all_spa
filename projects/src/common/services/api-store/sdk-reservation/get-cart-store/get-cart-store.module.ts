import { NgModule } from '@angular/core';
import { GetCartStoreModule } from '@common/store/get-cart';
import { EffectsModule } from '@ngrx/effects';
import { GetCartStoreService } from './get-cart-store.service';

@NgModule({
  providers: [GetCartStoreService],
  imports: [GetCartStoreModule, EffectsModule.forRoot()],
})
export class GetCartStoreServiceModule {}
