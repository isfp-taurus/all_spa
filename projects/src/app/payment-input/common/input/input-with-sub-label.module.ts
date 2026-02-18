import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputWithSubLabelComponent } from './input-with-sub-label.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TooltipDirectiveModule } from '@lib/directives';
import { StaticMsgModule } from '@lib/pipes';
import { ValidationErrorModule } from '@lib/components/base-ui-components/form/validation-error/validation-error.module';
import { IndicatorRequiredModule } from '@lib/components/base-ui-components/indicator-required/indicator-required.module';

/**
 * [サブラベルを含む入力ボックス] input Module (input, input-group)
 */
@NgModule({
  declarations: [InputWithSubLabelComponent],
  imports: [
    CommonModule,
    FormsModule,
    ValidationErrorModule,
    ReactiveFormsModule,
    IndicatorRequiredModule,
    TooltipDirectiveModule,
    StaticMsgModule,
  ],
  exports: [InputWithSubLabelComponent],
})
export class InputWithSubLabelModule {}
