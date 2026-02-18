import { NgModule } from '@angular/core';
import { PaymentInputStoreModule } from '@common/store/payment-input';
import { EffectsModule } from '@ngrx/effects';
import { PaymentInputStoreService } from './payment-input-store.service';

@NgModule({
  providers: [PaymentInputStoreService],
  imports: [PaymentInputStoreModule, EffectsModule.forRoot()],
})
export class PaymentInputStoreServiceModule {}
