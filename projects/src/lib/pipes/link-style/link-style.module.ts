import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { LinkStylePipe } from './link-style.pipe';

/**
 * テキストリンク用スタイル適用処理Module
 */
@NgModule({
  declarations: [LinkStylePipe],
  imports: [CommonModule],
  exports: [LinkStylePipe],
})
export class LinkStylePipeModule {}
