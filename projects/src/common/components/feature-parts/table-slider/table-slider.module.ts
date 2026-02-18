import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableSliderComponent } from './table-slider.component';
import { StaticMsgModule } from '@lib/pipes';

@NgModule({
  declarations: [TableSliderComponent],
  imports: [CommonModule, StaticMsgModule],
  exports: [TableSliderComponent],
})
export class TableSliderModule {}
