import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ValidationErrorComponent } from './validation-error.component';
import { TranslateModule } from '@ngx-translate/core';
import { ParamsTranslateModule, PopupIndicatorPipeModule, MetaUrlModule, LinkStylePipeModule } from '../../../../pipes';

/**
 * [BaseUI] 入力エラー案内Module
 */
@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    ParamsTranslateModule,
    PopupIndicatorPipeModule,
    MetaUrlModule,
    LinkStylePipeModule,
  ],
  declarations: [ValidationErrorComponent],
  exports: [ValidationErrorComponent],
})
export class ValidationErrorModule {}
