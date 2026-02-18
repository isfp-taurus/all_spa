import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IndicatorPopupComponent } from './indicator-popup.component';
import { StaticMsgModule } from '../../../pipes';

/**
 * [BaseUI] ポップアップインジケータModule
 */
@NgModule({
  imports: [CommonModule, StaticMsgModule],
  declarations: [IndicatorPopupComponent],
  exports: [IndicatorPopupComponent],
})
export class IndicatorPopupModule {}
