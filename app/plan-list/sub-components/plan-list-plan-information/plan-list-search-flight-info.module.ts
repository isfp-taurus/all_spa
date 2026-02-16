import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { AmountFormatModule, ParamsTranslateModule, StaticMsgModule } from '@lib/pipes';
import { PlanListSearchFlightInfoComponent } from './plan-list-search-flight-info.component';

@NgModule({
  declarations: [PlanListSearchFlightInfoComponent],
  imports: [CommonModule, TranslateModule, ParamsTranslateModule, FormsModule, AmountFormatModule, StaticMsgModule],
  exports: [PlanListSearchFlightInfoComponent],
})
export class PlanListSearchFlightInfoModule {}
