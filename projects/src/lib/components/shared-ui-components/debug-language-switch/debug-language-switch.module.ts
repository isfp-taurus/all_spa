import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { DebugLanguageSwitchComponent } from './debug-language-switch.component';
import { SelectModule } from '../../../components/base-ui-components/form/select/select.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

/**
 * [SharedUI] 言語切り替え処理（デバッグ用）Module
 */
@NgModule({
  declarations: [DebugLanguageSwitchComponent],
  imports: [CommonModule, TranslateModule, SelectModule, FormsModule, ReactiveFormsModule],
  exports: [DebugLanguageSwitchComponent],
})
export class DebugLanguageSwitchModule {}
