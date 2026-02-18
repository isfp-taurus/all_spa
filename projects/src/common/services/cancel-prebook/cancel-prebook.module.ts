import { NgModule } from '@angular/core';
import { DeletePrebookedOrderStoreServiceModule } from '../api-store/sdk-reservation/delete-prebooked-order-store/delete-prebooked-order-store.module';
import { LocalPlanServiceModule } from '../local-plan/local-plan.module';
import { CurrentCartStoreServiceModule } from '../store/common/current-cart-store/current-cart-store.module';
import { CurrentPlanStoreServiceModule } from '../store/common/current-plan-store/current-plan-store.module';
import { CancelPrebookService } from './cancel-prebook.service';

@NgModule({
  providers: [CancelPrebookService],
  imports: [
    CurrentCartStoreServiceModule,
    CurrentPlanStoreServiceModule,
    DeletePrebookedOrderStoreServiceModule,
    LocalPlanServiceModule,
  ],
})
export class CancelPrebookServiceModule {}
