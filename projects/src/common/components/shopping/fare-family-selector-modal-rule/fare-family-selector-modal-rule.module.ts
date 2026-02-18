import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FareFamilySelectorModalRuleComponent } from './fare-family-selector-modal-rule.component';
import { TranslateModule } from '@ngx-translate/core';
import { TextTooltipModule } from '@lib/components';
import { StaticMsgModule, PopupIndicatorPipeModule, LinkStylePipeModule } from '@lib/pipes';
import { AmountFormatModule } from 'src/lib/pipes/amount-format/amount-format.module';
import { ThrottleClickDirectiveModule } from '@lib/directives';

/**
 * FF選択モーダル
 * FF情報の画面部品
 */
@NgModule({
  declarations: [FareFamilySelectorModalRuleComponent],
  imports: [
    CommonModule,
    StaticMsgModule,
    PopupIndicatorPipeModule,
    LinkStylePipeModule,
    TranslateModule,
    TextTooltipModule,
    AmountFormatModule,
    ThrottleClickDirectiveModule,
  ],
  exports: [FareFamilySelectorModalRuleComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class FareFamilySelectorModalRuleModule {}
