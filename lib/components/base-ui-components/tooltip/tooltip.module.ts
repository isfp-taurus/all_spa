import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TooltipComponent } from './tooltip.component';
import { TooltipDirectiveModule } from '../../../directives';

/**
 * [BaseUI] tootip Module
 */
@NgModule({
  imports: [CommonModule, TooltipDirectiveModule],
  declarations: [TooltipComponent],
  exports: [TooltipComponent],
})
export class TextTooltipModule {}
