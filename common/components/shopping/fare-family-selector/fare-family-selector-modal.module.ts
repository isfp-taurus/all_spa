import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FareFamilySelectorModalComponent } from './fare-family-selector-modal.component';
import { FareFamilySelectorModalItemModule } from './fare-family-selector-modal-item/fare-family-selector-modal-item.module';
import { FlightPlanModule } from '@common/components/shopping/flight-plan/flight-plan.module';
import { StaticMsgModule } from '@lib/pipes';
import { ThrottleClickDirectiveModule } from '@lib/directives';

@NgModule({
  declarations: [FareFamilySelectorModalComponent],
  imports: [
    CommonModule,
    StaticMsgModule,
    FareFamilySelectorModalItemModule,
    FlightPlanModule,
    ThrottleClickDirectiveModule,
  ],
  exports: [FareFamilySelectorModalComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class FareFamilySelectorModalModule {}
