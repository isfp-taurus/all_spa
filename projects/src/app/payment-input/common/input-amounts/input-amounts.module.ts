import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputAmountsComponent } from './input-amounts.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ValidationErrorModule } from '@lib/components/base-ui-components/form/validation-error/validation-error.module';
import { TooltipDirectiveModule } from '@lib/directives';
import { IndicatorRequiredModule } from '@lib/components/base-ui-components/indicator-required/indicator-required.module';
import { StaticMsgModule } from '@lib/pipes';

/**
 * [金額フォーマットに対応した入力ボックス] input Module (input, input-group)
 */
@NgModule({
  declarations: [InputAmountsComponent],
  imports: [
    CommonModule,
    FormsModule,
    ValidationErrorModule,
    ReactiveFormsModule,
    IndicatorRequiredModule,
    TooltipDirectiveModule,
    StaticMsgModule,
  ],
  exports: [InputAmountsComponent],
})
export class InputAmountsModule {}
