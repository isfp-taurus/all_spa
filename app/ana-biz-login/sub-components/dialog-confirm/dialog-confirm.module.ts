import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogConfirmComponent } from './dialog-confirm.component';
import { StaticMsgModule } from '@lib/pipes';
import { DialogConfirmService } from './dialog-confirm.service';
import { Overlay } from '@angular/cdk/overlay';
import { ThrottleClickDirectiveModule } from '@lib/directives';
import { PopupIndicatorPipeModule } from '@lib/pipes/popup-indicator/popup-indicator.module';
import { MetaUrlModule } from '@lib/pipes/meta-url/meta-url.module';
import { LinkStylePipeModule } from '@lib/pipes/link-style/link-style.module';
import { ParamsTranslateModule } from '@lib/pipes/params-translate/params-translate.module';

/**
 * 確認ダイアログModule
 */
@NgModule({
  imports: [
    CommonModule,
    StaticMsgModule,
    ThrottleClickDirectiveModule,
    PopupIndicatorPipeModule,
    MetaUrlModule,
    LinkStylePipeModule,
    ParamsTranslateModule,
  ],
  providers: [DialogConfirmService, Overlay],
  declarations: [DialogConfirmComponent],
})
export class DialogConfirmModule {}
