import { NgModule } from '@angular/core';
import { CommonLibModule, ErrorsHandlerService, ModalServiceModule } from '@lib/services';
import { AswMasterStoreModule } from '@lib/store';
import { CreatePlansStoreServiceModule } from '../api-store/sdk-reservation/create-plans-store/create-plans-store.module';
import { DeletePlansStoreServiceModule } from '../api-store/sdk-reservation/delete-plans-store/delete-plans-store.module';
import { GetCartStoreServiceModule } from '../api-store/sdk-reservation/get-cart-store/get-cart-store.module';
import { LocalPlanServiceModule } from '../local-plan/local-plan.module';
import { PlanListStoreServiceModule } from '../store/plan-list/plan-list-store/plan-list-store.module';
import { PlanListService } from './plan-list.service';

@NgModule({
  imports: [
    CommonLibModule,
    AswMasterStoreModule,
    ModalServiceModule,
    GetCartStoreServiceModule,
    DeletePlansStoreServiceModule,
    CreatePlansStoreServiceModule,
    LocalPlanServiceModule,
    PlanListStoreServiceModule,
  ],
  providers: [PlanListService, ErrorsHandlerService],
})
export class PlanListServiceModule {}
