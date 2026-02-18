import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CheckboxComponent } from './checkbox.component';
import { FormsModule } from '@angular/forms';
import { ValidationErrorModule } from '../validation-error/validation-error.module';
import { CheckboxGroupComponent } from './checkbox-group.component';
import { IndicatorRequiredModule } from '../../indicator-required/indicator-required.module';

/**
 * [BaseUI] checkbox Module (checkbox, checkbox-group)
 */
@NgModule({
  imports: [CommonModule, FormsModule, ValidationErrorModule, IndicatorRequiredModule],
  declarations: [CheckboxComponent, CheckboxGroupComponent],
  exports: [CheckboxComponent, CheckboxGroupComponent],
})
export class CheckboxModule {}
