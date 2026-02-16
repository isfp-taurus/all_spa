import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TooltipDirective } from './tooltip.directive';

/**
 * [BaseUI] tootip directive Module
 */
@NgModule({
  imports: [CommonModule],
  declarations: [TooltipDirective],
  exports: [TooltipDirective],
})
export class TooltipDirectiveModule {}
