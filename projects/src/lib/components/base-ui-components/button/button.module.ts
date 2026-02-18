import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from './button.component';
import { ThrottleClickDirectiveModule } from '../../../directives';
import { StaticMsgModule } from '../../../pipes';

/**
 * [BaseUI] ボタンModule
 */
@NgModule({
  imports: [CommonModule, ThrottleClickDirectiveModule, StaticMsgModule],
  declarations: [ButtonComponent],
  exports: [ButtonComponent],
})
export class ButtonModule {}
