import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PetInfoInputComponent } from './pet-info-input.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TooltipDirectiveModule } from '@lib/directives';
import { StaticMsgModule } from '@lib/pipes';
import { IndicatorRequiredModule, ValidationErrorModule } from '@lib/components';

/**
 * ペット情報入力モジュール
 */
@NgModule({
  declarations: [PetInfoInputComponent],
  imports: [
    CommonModule,
    FormsModule,
    ValidationErrorModule,
    ReactiveFormsModule,
    IndicatorRequiredModule,
    TooltipDirectiveModule,
    StaticMsgModule,
  ],
  exports: [PetInfoInputComponent],
})
export class PetInfoInputModule {}
