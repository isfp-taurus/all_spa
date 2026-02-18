import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { InformativeSeatmapHeaderComponent } from './informative-seatmap-header.component';
import { StaticMsgModule } from '../../../pipes';

/**
 * S03-P030_シートマップ（参照）画面用ヘッダーModule
 */
@NgModule({
  declarations: [InformativeSeatmapHeaderComponent],
  imports: [CommonModule, StaticMsgModule],
  exports: [InformativeSeatmapHeaderComponent],
})
export class InformativeSeatmapHeaderModule {}
