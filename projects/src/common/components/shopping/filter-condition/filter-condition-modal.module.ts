import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FilterConditionModalComponent } from './filter-condition-modal.component';
import { TranslateModule } from '@ngx-translate/core';
import { RangeSliderModule, ValidationErrorModule } from '@lib/components';
import { StaticMsgModule } from '@lib/pipes';
import { ThrottleClickDirectiveModule } from '@lib/directives';

@NgModule({
  declarations: [FilterConditionModalComponent],
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    RangeSliderModule,
    StaticMsgModule,
    ThrottleClickDirectiveModule,
    ValidationErrorModule,
  ],
  exports: [FilterConditionModalComponent],
})
export class FilterConditionModalModule {}
