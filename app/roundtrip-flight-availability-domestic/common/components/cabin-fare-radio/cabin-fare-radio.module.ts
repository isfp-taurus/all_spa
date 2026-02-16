import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CabinFareRadioComponent } from './cabin-fare-radio.component';
import { CabinFareRadioGroupComponent } from './cabin-fare-radio-group.component';

/**
 * キャビンクラス・運賃オプションのラジオボタンModule
 */
@NgModule({
  imports: [CommonModule],
  declarations: [CabinFareRadioComponent, CabinFareRadioGroupComponent],
  exports: [CabinFareRadioComponent, CabinFareRadioGroupComponent],
})
export class CabinFareRadioModule {}
