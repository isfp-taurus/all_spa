import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VerticalSlidePerDirective } from './vertical-slide-per.directive';

@NgModule({
  declarations: [VerticalSlidePerDirective],
  imports: [CommonModule],
  exports: [VerticalSlidePerDirective],
})
export class VerticalSlidePerModule {}
