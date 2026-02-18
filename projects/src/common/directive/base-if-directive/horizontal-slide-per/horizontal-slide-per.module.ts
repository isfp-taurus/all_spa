import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HorizontalSlidePerDirective } from './horizontal-slide-per.directive';

@NgModule({
  declarations: [HorizontalSlidePerDirective],
  imports: [CommonModule],
  exports: [HorizontalSlidePerDirective],
})
export class HorizontalSlidePerModule {}
