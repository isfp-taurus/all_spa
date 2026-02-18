import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilterFlightModalService } from './filter-flight-modal.service';
import { ButtonModule, CheckboxModule, RadiobuttonModule, RangeSliderModule } from '@lib/components';
import { FilterFlightModalComponent } from './filter-flight-modal.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { StaticMsgModule } from '@lib/pipes';
import { BaseModalModule } from '../base-modal';

/**
 * フィルタ条件モーダルModule
 */
@NgModule({
  declarations: [FilterFlightModalComponent],
  imports: [
    CommonModule,
    BaseModalModule,
    ButtonModule,
    CheckboxModule,
    RangeSliderModule,
    FormsModule,
    ReactiveFormsModule,
    StaticMsgModule,
    RadiobuttonModule,
  ],
  providers: [FilterFlightModalService],
  exports: [FilterFlightModalComponent],
})
export class FilterFlightModalModule {}
