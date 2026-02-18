import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToggleComponent } from './toggle.component';
import { FormsModule } from '@angular/forms';

/**
 * [BaseUI] toggle switch Module
 */
@NgModule({
  imports: [CommonModule, FormsModule],
  declarations: [ToggleComponent],
  exports: [ToggleComponent],
})
export class ToggleModule {}
