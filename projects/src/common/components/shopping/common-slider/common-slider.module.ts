import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommonSliderComponent } from './common-slider.component';
import { StaticMsgModule } from '@lib/pipes';

@NgModule({
  declarations: [CommonSliderComponent],
  imports: [CommonModule, StaticMsgModule],
  exports: [CommonSliderComponent],
})
export class CommonSliderModule {}
