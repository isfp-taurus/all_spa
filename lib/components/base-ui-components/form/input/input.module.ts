import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputComponent } from './input.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ValidationErrorModule } from '../validation-error/validation-error.module';
import { TooltipDirectiveModule } from '../../../../directives';
import { IndicatorRequiredModule } from '../../indicator-required/indicator-required.module';
import { StaticMsgModule } from '../../../../pipes';

/**
 * [BaseUI] input Module (input, input-group)
 */
@NgModule({
  declarations: [InputComponent],
  imports: [
    CommonModule,
    FormsModule,
    ValidationErrorModule,
    ReactiveFormsModule,
    IndicatorRequiredModule,
    TooltipDirectiveModule,
    StaticMsgModule,
  ],
  exports: [InputComponent],
})
export class InputModule {}
