import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlightPlanComponent } from './flight-plan.component';
import { TranslateModule } from '@ngx-translate/core';
import { DateFormatModule, StaticMsgModule } from '@lib/pipes';
import { TextTooltipModule } from '@lib/components';
import { ThrottleClickDirectiveModule } from '@lib/directives';

/**
 * フライトの(最新)出発・到着地、出発到着時刻、所要時間、乗継回数を表示する画面部品
 */
@NgModule({
  declarations: [FlightPlanComponent],
  imports: [
    CommonModule,
    TranslateModule,
    DateFormatModule,
    StaticMsgModule,
    TextTooltipModule,
    ThrottleClickDirectiveModule,
  ],
  exports: [FlightPlanComponent],
})
export class FlightPlanModule {}
