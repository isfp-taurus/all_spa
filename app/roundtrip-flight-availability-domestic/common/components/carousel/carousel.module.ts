import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarouselComponent } from './carousel.component';
import { DeviceIfDirectiveModule } from '../../directives';
import { StaticMsgModule } from '@lib/pipes';

/**
 * カルーセルModule
 */
@NgModule({
  declarations: [CarouselComponent],
  imports: [CommonModule, DeviceIfDirectiveModule, StaticMsgModule],
  exports: [CarouselComponent],
})
export class CarouselModule {}
