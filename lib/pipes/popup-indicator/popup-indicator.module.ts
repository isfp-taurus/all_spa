import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { PopupIndicatorPipe } from './popup-indicator.pipe';

/**
 * 文言内のポップアップインジケータ付与Module
 */
@NgModule({
  declarations: [PopupIndicatorPipe],
  imports: [CommonModule, TranslateModule],
  exports: [PopupIndicatorPipe],
})
export class PopupIndicatorPipeModule {}
