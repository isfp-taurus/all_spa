import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogComponent } from './dialog.component';
import { ParamsTranslateModule } from '../../../pipes/params-translate/params-translate.module';
import { PopupIndicatorPipeModule } from '../../../pipes/popup-indicator/popup-indicator.module';
import { MetaUrlModule } from '../../../pipes/meta-url/meta-url.module';
import { LinkStylePipeModule } from '../../../pipes/link-style/link-style.module';
import { StaticMsgModule } from '../../../pipes/static-msg/static-msg.module';
import { ThrottleClickDirectiveModule } from '../../../directives';

/**
 * [BaseUI] 確認ダイアログModule
 */
@NgModule({
  imports: [
    CommonModule,
    ParamsTranslateModule,
    PopupIndicatorPipeModule,
    ThrottleClickDirectiveModule,
    MetaUrlModule,
    LinkStylePipeModule,
    StaticMsgModule,
  ],
  declarations: [DialogComponent],
})
export class DialogModule {}
