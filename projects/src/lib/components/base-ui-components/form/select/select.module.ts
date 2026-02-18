import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectComponent } from './select.component';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { SelectGroupComponent } from './select-group.component';
import { ValidationErrorModule } from '../validation-error/validation-error.module';
import { IndicatorRequiredModule } from '../../indicator-required/indicator-required.module';

/**
 * [BaseUI] select Module (select, select-group)
 */
@NgModule({
  imports: [CommonModule, TranslateModule, FormsModule, ValidationErrorModule, IndicatorRequiredModule],
  declarations: [SelectComponent, SelectGroupComponent],
  exports: [SelectComponent, SelectGroupComponent],
})
export class SelectModule {}
