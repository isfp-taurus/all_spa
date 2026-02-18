import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AmountBreakdownModalComponent } from './amount-breakdown-modal.component';
import { AmountBreakdownModalService } from './amount-breakdown-modal.service';
import { ButtonModule, RadiobuttonModule } from '@lib/components';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AmountFormatModule, StaticMsgModule } from '@lib/pipes';
import { BaseModalModule } from '../base-modal/base-modal.module';
import { CabinFareRadioModule } from '../cabin-fare-radio/cabin-fare-radio.module';

/**
 * 金額内訳モーダルModule
 */
@NgModule({
  imports: [
    CommonModule,
    BaseModalModule,
    ButtonModule,
    RadiobuttonModule,
    FormsModule,
    ReactiveFormsModule,
    CabinFareRadioModule,
    StaticMsgModule,
    AmountFormatModule,
  ],
  declarations: [AmountBreakdownModalComponent],
  providers: [AmountBreakdownModalService],
})
export class AmountBreakdownModalModule {}
