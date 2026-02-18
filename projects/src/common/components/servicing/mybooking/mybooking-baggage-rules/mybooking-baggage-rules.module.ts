import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AmountFormatModule, StaticMsgModule } from '@lib/pipes';
import { MybookingBaggageRulesComponent } from './mybooking-baggage-rules.component';
import { MybookingBaggageRulesLoadingComponent } from './mybooking-baggage-rules-loading/mybooking-baggage-rules-loading.component';
import { MybookingBaggageRulesDotComponent } from './mybooking-baggage-rules-dot/mybooking-baggage-rules-dot.component';
import { AswMasterStoreModule } from '@lib/store';
import { TooltipDirectiveModule } from '@lib/directives';
import { TableSliderModule } from '@common/components/feature-parts/table-slider/table-slider.module';
import { MybookingBaggageRulesService } from './mybooking-baggage-rules.service';

/**
 * 手荷物ルール
 */
@NgModule({
  declarations: [
    MybookingBaggageRulesComponent,
    MybookingBaggageRulesLoadingComponent,
    MybookingBaggageRulesDotComponent,
  ],
  imports: [
    CommonModule,
    StaticMsgModule,
    AswMasterStoreModule,
    AmountFormatModule,
    TooltipDirectiveModule,
    TableSliderModule,
  ],
  exports: [MybookingBaggageRulesComponent],
  providers: [MybookingBaggageRulesService],
})
export class MybookingBaggageRulesModule {}
