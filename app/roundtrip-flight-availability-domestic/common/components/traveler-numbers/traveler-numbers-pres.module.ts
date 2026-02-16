import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StaticMsgModule } from '@lib/pipes';
import { TravelerNumbersPresComponent } from './traveler-numbers-pres.component';

/**
 * 搭乗者人数リストPresModule
 */
@NgModule({
  imports: [CommonModule, StaticMsgModule],
  declarations: [TravelerNumbersPresComponent],
  exports: [TravelerNumbersPresComponent],
})
export class TravelerNumbersPresModule {}
