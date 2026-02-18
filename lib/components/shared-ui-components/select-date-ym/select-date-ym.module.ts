import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectDateYmComponent } from './select-date-ym.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SelectModule } from '../../../components/base-ui-components/form/select/select.module';
import { ValidationErrorModule } from '../../../components/base-ui-components/form/validation-error/validation-error.module';
import { StaticMsgModule } from '../../../pipes';

/**
 * [SharedUI] 日付プルダウン（年月）Module
 */
@NgModule({
  imports: [CommonModule, SelectModule, FormsModule, ReactiveFormsModule, ValidationErrorModule, StaticMsgModule],
  declarations: [SelectDateYmComponent],
  exports: [SelectDateYmComponent],
})
export class SelectDateYmModule {}
