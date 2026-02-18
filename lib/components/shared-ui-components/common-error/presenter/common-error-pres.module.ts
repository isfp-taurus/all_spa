import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommonErrorPresComponent } from './common-error-pres.component';
import {
  ParamsTranslateModule,
  PopupIndicatorPipeModule,
  MetaUrlModule,
  LinkStylePipeModule,
  StaticMsgModule,
} from '../../../../pipes';
import { ButtonModule } from '../../../../components/base-ui-components/button/button.module';

/**
 * [SharedUI] 共通エラー画面 (presenter) Module
 */
@NgModule({
  declarations: [CommonErrorPresComponent],
  imports: [
    CommonModule,
    ButtonModule,
    ParamsTranslateModule,
    PopupIndicatorPipeModule,
    MetaUrlModule,
    LinkStylePipeModule,
    StaticMsgModule,
  ],
  exports: [CommonErrorPresComponent],
})
export class CommonErrorPresModule {}
