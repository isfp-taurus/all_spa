import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FareFamilyHeaderContComponent } from './fare-family-header-cont.component';
import { StaticMsgModule, MetaUrlModule } from '@lib/pipes';
import { IndicatorPopupModule } from '@lib/components';

/**
 * FFヘッダContModule
 */
@NgModule({
  declarations: [FareFamilyHeaderContComponent],
  imports: [CommonModule, StaticMsgModule, MetaUrlModule, IndicatorPopupModule],
  exports: [FareFamilyHeaderContComponent],
})
export class FareFamilyHeaderContModule {}
