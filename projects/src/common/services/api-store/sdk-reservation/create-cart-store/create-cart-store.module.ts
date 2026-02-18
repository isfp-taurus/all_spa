import { NgModule } from '@angular/core';
import { CreateCartStoreModule } from '../../../../store/create-cart';
import { EffectsModule } from '@ngrx/effects';
import { CreateCartStoreService } from './create-cart-store.service';

@NgModule({
  providers: [CreateCartStoreService],
  imports: [CreateCartStoreModule, EffectsModule.forRoot()],
})
export class CreateCartStoreServiceModule {}
