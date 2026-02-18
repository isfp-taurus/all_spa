import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DateSelectorComponent } from './date-selector.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { StaticMsgModule, StaticMsgPipe } from '../../../pipes';
import { ValidationErrorModule } from '../../../components/base-ui-components/form/validation-error/validation-error.module';
import { DateFormatModule } from '../../../pipes/date-format/date-format.module';
import { ThrottleClickDirectiveModule } from '@lib/directives';

@NgModule({
  providers: [StaticMsgPipe],
  declarations: [DateSelectorComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: [DateSelectorComponent],
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    StaticMsgModule,
    ValidationErrorModule,
    DateFormatModule,
    ThrottleClickDirectiveModule,
  ],
})
export class DateSelectorModule {}
