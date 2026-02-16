import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ThrottleClickDirective } from './throttle-click.directive';

/**
 * 多重リクエスト防止Module
 */
@NgModule({
  imports: [CommonModule],
  declarations: [ThrottleClickDirective],
  exports: [ThrottleClickDirective],
})
export class ThrottleClickDirectiveModule {}
