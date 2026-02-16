import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectNextPageModalComponent } from './select-next-page-modal.component';
import { TranslateModule } from '@ngx-translate/core';
import { ThrottleClickDirectiveModule } from '@lib/directives';
import { StaticMsgModule, StaticMsgPipe } from '@lib/pipes';
import {
  CreateOrderStoreServiceModule,
  CurrentCartStoreServiceModule,
  CurrentPlanStoreServiceModule,
  DeliveryInformationStoreServiceModule,
  GetCartStoreServiceModule,
  GetOrderStoreServiceModule,
  LocalPlanServiceModule,
  PlanReviewStoreServiceModule,
} from '@common/services';
import { SelectNextPageModalService } from './select-next-page-modal.service';
import { CommonLibModule } from '@lib/services';

@NgModule({
  declarations: [SelectNextPageModalComponent],
  imports: [
    CommonModule,
    CommonLibModule,
    TranslateModule,
    ThrottleClickDirectiveModule,
    CreateOrderStoreServiceModule,
    CurrentCartStoreServiceModule,
    DeliveryInformationStoreServiceModule,
    GetCartStoreServiceModule,
    GetOrderStoreServiceModule,
    LocalPlanServiceModule,
    PlanReviewStoreServiceModule,
    StaticMsgModule,
    DeliveryInformationStoreServiceModule,
    CurrentPlanStoreServiceModule,
  ],
  exports: [SelectNextPageModalComponent],
  providers: [StaticMsgPipe, SelectNextPageModalService],
})
export class SelectNextPageModalModule {}
