import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ParamsTranslatePipe } from './params-translate.pipe';

/**
 * 埋め込み文字列の置換Module
 */
@NgModule({
  declarations: [ParamsTranslatePipe],
  imports: [CommonModule, TranslateModule],
  exports: [ParamsTranslatePipe],
})
export class ParamsTranslateModule {}
