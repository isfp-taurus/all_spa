import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SemiFixedAreaDirective } from './semi-fix.directive';

/**
 *  semi-fixed directive Module
 */
@NgModule({
  imports: [CommonModule],
  declarations: [SemiFixedAreaDirective],
  exports: [SemiFixedAreaDirective],
})
export class SemiFixedAreaDirectiveModule {}
