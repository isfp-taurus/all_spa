import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResultDateNaviPresComponent } from './result-date-navi-pres.component';
import { AmountFormatModule, StaticMsgModule } from '@lib/pipes';
import { ThrottleClickDirectiveModule } from '@lib/directives';
import { DateFormatModule } from '@lib/pipes/date-format/date-format.module';
import { FreedomDateNaviCarouselModule } from '../../freedom-date-navi-carousel';

/**
 * 7日間カレンダーPresModule
 */
@NgModule({
  declarations: [ResultDateNaviPresComponent],
  exports: [ResultDateNaviPresComponent],
  imports: [
    CommonModule,
    StaticMsgModule,
    ThrottleClickDirectiveModule,
    DateFormatModule,
    AmountFormatModule,
    FreedomDateNaviCarouselModule,
  ],
})
export class ResultDateNaviPresModule {}
