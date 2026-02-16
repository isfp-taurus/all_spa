import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StaticMsgModule } from '@lib/pipes';
import { BlockSliderComponent } from './block-slider.component';

@NgModule({
  declarations: [BlockSliderComponent],
  imports: [CommonModule, StaticMsgModule],
  exports: [BlockSliderComponent],
})
export class BlockSliderModule {}
