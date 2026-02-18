/**
 * デバッグエリア
 */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DebugLanguageSwitchModule } from '../debug-language-switch//debug-language-switch.module'; //読み込み順エラーのため直接パス
import { DebugAreaComponent } from './debug-area.component';

/**
 * デバッグエリア
 */
@NgModule({
  declarations: [DebugAreaComponent],
  imports: [CommonModule, DebugLanguageSwitchModule],
  exports: [DebugAreaComponent],
})
export class DebugAreaModule {}
