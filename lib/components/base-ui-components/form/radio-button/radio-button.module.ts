import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RadiobuttonComponent } from './radio-button.component';
import { TranslateModule } from '@ngx-translate/core';
import { RadioGroupComponent } from './radio-group.component';
import { ValidationErrorModule } from '../validation-error/validation-error.module';

/**
 * [BaseUI] radio Module (radio-button, radio-group)
 */
@NgModule({
  imports: [CommonModule, TranslateModule, ValidationErrorModule],
  declarations: [RadiobuttonComponent, RadioGroupComponent],
  exports: [RadiobuttonComponent, RadioGroupComponent],
})
export class RadiobuttonModule {}
