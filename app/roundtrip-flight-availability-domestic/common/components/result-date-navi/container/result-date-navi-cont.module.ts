import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResultDateNaviContComponent } from './result-date-navi-cont.component';
import { DialogDisplayServiceModule } from '@lib/services';
import { ResultDateNaviPresModule } from '../presenter/result-date-navi-pres.module';

/**
 * 7日間カレンダーContModule
 */
@NgModule({
  declarations: [ResultDateNaviContComponent],
  imports: [CommonModule, ResultDateNaviPresModule, DialogDisplayServiceModule],
  exports: [ResultDateNaviContComponent],
})
export class ResultDateNaviContModule {}
