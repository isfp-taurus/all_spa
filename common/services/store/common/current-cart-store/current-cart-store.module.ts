import { NgModule } from '@angular/core';
import { CurrentCartStoreModule } from '@common/store';
import { EffectsModule } from '@ngrx/effects';
import { CurrentCartStoreService } from './current-cart-store.service';

@NgModule({
  providers: [CurrentCartStoreService],
  imports: [CurrentCartStoreModule, EffectsModule.forRoot()],
})
export class CurrentCartStoreServiceModule {}
