import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchFlightRulesLoaddingComponent } from './search-flight-rules-loadding.component';
import { StaticMsgModule } from '@lib/pipes';

@NgModule({
  declarations: [SearchFlightRulesLoaddingComponent],
  imports: [CommonModule, StaticMsgModule],
  exports: [SearchFlightRulesLoaddingComponent],
})
export class SearchFlightRulesLoaddingModule {}
