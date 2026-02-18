import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RadiobuttonBoxComponent } from './radiobutton-box.component';
import { ValidationErrorModule } from '../validation-error/validation-error.module';

/**
 * [BaseUI] box radio Module (radio-button)
 */
@NgModule({
  imports: [CommonModule, ValidationErrorModule],
  declarations: [RadiobuttonBoxComponent],
  exports: [RadiobuttonBoxComponent],
})
export class RadiobuttonBoxModule {}
