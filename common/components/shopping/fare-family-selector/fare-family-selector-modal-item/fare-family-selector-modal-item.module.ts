import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FareFamilySelectorModalItemComponent } from './fare-family-selector-modal-item.component';
import { FareFamilySelectorModalRuleModule } from '@common/components/shopping/fare-family-selector-modal-rule/fare-family-selector-modal-rule.module';
import { AmountFormatModule } from 'src/lib/pipes/amount-format/amount-format.module';
import { StaticMsgModule } from '@lib/pipes';
import { ThrottleClickDirectiveModule } from '@lib/directives';

/**
 * FF選択モーダル
 * FF情報の画面部品
 */
@NgModule({
  declarations: [FareFamilySelectorModalItemComponent],
  exports: [FareFamilySelectorModalItemComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    FareFamilySelectorModalRuleModule,
    AmountFormatModule,
    StaticMsgModule,
    ThrottleClickDirectiveModule,
  ],
})
export class FareFamilySelectorModalItemModule {}
