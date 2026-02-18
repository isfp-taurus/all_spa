import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ErrorGuidancePresComponent } from './error-guidance-pres.component';
import {
  ParamsTranslateModule,
  PopupIndicatorPipeModule,
  MetaUrlModule,
  LinkStylePipeModule,
  StaticMsgModule,
} from '../../../../pipes';

/**
 * [SharedUI] 注意喚起エリア（エラー） (presenter) Module
 */
@NgModule({
  declarations: [ErrorGuidancePresComponent],
  imports: [
    CommonModule,
    ParamsTranslateModule,
    PopupIndicatorPipeModule,
    MetaUrlModule,
    LinkStylePipeModule,
    StaticMsgModule,
  ],
  exports: [ErrorGuidancePresComponent],
})
export class ErrorGuidancePresModule {}
