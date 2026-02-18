import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { PlanListSubHeaderComponent } from './plan-list-sub-header.component';
import { TranslateModule } from '@ngx-translate/core';
import { StaticMsgModule } from '@lib/pipes';
import { PlanListServiceModule, PlanListStoreServiceModule } from '@common/services';
import { TemporaryUrlModalModule } from '@common/components';
import { ThrottleClickDirectiveModule } from '@lib/directives';

@NgModule({
  declarations: [PlanListSubHeaderComponent],
  imports: [
    CommonModule,
    TranslateModule,
    StaticMsgModule,
    PlanListStoreServiceModule,
    TemporaryUrlModalModule,
    PlanListServiceModule,
    ThrottleClickDirectiveModule,
  ],
  exports: [PlanListSubHeaderComponent],
})
export class PlanListSubHeaderModule {}
