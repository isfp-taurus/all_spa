import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FareOptionModalComponent } from './fare-option-modal.component';
import { FareOptionModalService } from './fare-option-modal.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { StaticMsgModule } from '@lib/pipes';
import { BaseModalModule } from '../base-modal/base-modal.module';
import { ButtonModule } from '@lib/components';
import { CabinFareRadioModule } from '../cabin-fare-radio/cabin-fare-radio.module';

/**
 * 運賃オプションモーダルModule
 */
@NgModule({
  imports: [
    CommonModule,
    BaseModalModule,
    ButtonModule,
    CabinFareRadioModule,
    FormsModule,
    ReactiveFormsModule,
    StaticMsgModule,
  ],
  declarations: [FareOptionModalComponent],
  providers: [FareOptionModalService],
})
export class FareOptionModalModule {}
