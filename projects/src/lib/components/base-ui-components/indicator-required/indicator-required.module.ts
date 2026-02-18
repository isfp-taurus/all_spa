import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IndicatorRequiredComponent } from './indicator-required.component';
import { StaticMsgModule } from '../../../pipes';

/**
 * [BaseUI] 入力必須インジケータModule
 */
@NgModule({
  imports: [CommonModule, StaticMsgModule],
  declarations: [IndicatorRequiredComponent],
  exports: [IndicatorRequiredComponent],
})
export class IndicatorRequiredModule {}
