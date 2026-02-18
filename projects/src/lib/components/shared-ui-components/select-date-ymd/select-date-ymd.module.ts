import { forwardRef, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectDateYmdComponent } from './select-date-ymd.component';
import { FormsModule, NG_VALIDATORS, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ValidationErrorModule } from '../../../components/base-ui-components/form/validation-error/validation-error.module';
import { TranslateModule } from '@ngx-translate/core';
import { StaticMsgModule } from '../../../pipes';

@NgModule({
  imports: [CommonModule, FormsModule, TranslateModule, ValidationErrorModule, StaticMsgModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectDateYmdComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => SelectDateYmdComponent),
      multi: true,
    },
  ],
  declarations: [SelectDateYmdComponent],
  exports: [SelectDateYmdComponent],
})
export class SelectDateYmdModule {}
