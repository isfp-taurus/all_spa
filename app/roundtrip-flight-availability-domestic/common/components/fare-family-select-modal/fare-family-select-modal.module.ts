import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FareFamilySelectModalComponent } from './fare-family-select-modal.component';
import { FareFamilySelectModalService } from './fare-family-select-modal.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { StaticMsgModule, MetaUrlModule } from '@lib/pipes';
import { ButtonModule, IndicatorPopupModule } from '@lib/components';
import { DeviceIfDirectiveModule } from '../../../common/directives';
import { BaseModalModule } from '../base-modal/base-modal.module';
import { DateFormatModule } from '@lib/pipes/date-format/date-format.module';
import { AmountFormatModule } from '../../../../../lib/pipes/amount-format/amount-format.module';
import { ThrottleClickDirectiveModule } from '@lib/directives';

/**
 * FF選択モーダルModule
 */
@NgModule({
  declarations: [FareFamilySelectModalComponent],
  providers: [FareFamilySelectModalService],
  imports: [
    BaseModalModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    StaticMsgModule,
    IndicatorPopupModule,
    DeviceIfDirectiveModule,
    ButtonModule,
    DateFormatModule,
    AmountFormatModule,
    ThrottleClickDirectiveModule,
    MetaUrlModule,
  ],
})
export class FareFamilySelectModalModule {}
