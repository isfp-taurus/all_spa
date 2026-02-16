import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeviceIfDirectiveModule } from '../../directives';
import { ButtonModule } from '@lib/components';
import { StaticMsgModule } from '@lib/pipes';
import { SearchResultFooterComponent } from './search-result-footer.component';
import { AmountBreakdownModalModule } from '../amount-breakdown-modal';
import { AmountFormatModule } from '../../../../../lib/pipes/amount-format/amount-format.module';

/**
 * 検索結果フッタPresModule
 */
@NgModule({
  declarations: [SearchResultFooterComponent],
  exports: [SearchResultFooterComponent],
  imports: [
    CommonModule,
    DeviceIfDirectiveModule,
    ButtonModule,
    StaticMsgModule,
    AmountBreakdownModalModule,
    AmountFormatModule,
  ],
})
export class SearchResultFooterModule {}
