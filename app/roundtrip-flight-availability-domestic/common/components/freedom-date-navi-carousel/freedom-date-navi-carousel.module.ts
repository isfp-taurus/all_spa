import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FreedomDateNaviCarouselComponent } from './freedom-date-navi-carousel.component';
import { DeviceIfDirectiveModule } from '../../directives';
import { StaticMsgModule } from '@lib/pipes';

/**
 * カルーセル(自動計算)Module
 */
@NgModule({
  declarations: [FreedomDateNaviCarouselComponent],
  imports: [CommonModule, DeviceIfDirectiveModule, StaticMsgModule],
  exports: [FreedomDateNaviCarouselComponent],
})
export class FreedomDateNaviCarouselModule {}
