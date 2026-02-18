import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ValidationErrorModule } from '../validation-error/validation-error.module';
import { RangeSliderComponent } from './range-slider.component';
import { AmountFormatModule, StaticMsgModule, DateFormatModule } from '../../../../pipes';

/**
 * [BaseUI] レンジスライダーModule
 */
@NgModule({
  declarations: [RangeSliderComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ValidationErrorModule,
    AmountFormatModule,
    StaticMsgModule,
    DateFormatModule,
  ],
  exports: [RangeSliderComponent],
})
export class RangeSliderModule {}
