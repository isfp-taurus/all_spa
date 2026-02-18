import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StaticMsgPurePipe } from './static-msg-pure.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { MetaUrlModule } from '../meta-url/meta-url.module';
import { PopupIndicatorPipeModule } from '../popup-indicator/popup-indicator.module';
import { LinkStylePipeModule } from '../link-style/link-style.module';
import { MetaUrlPipe } from '../meta-url/meta-url.pipe';
import { PopupIndicatorPipe } from '../popup-indicator/popup-indicator.pipe';
import { LinkStylePipe } from '../link-style/link-style.pipe';

@NgModule({
  declarations: [StaticMsgPurePipe],
  providers: [MetaUrlPipe, PopupIndicatorPipe, LinkStylePipe],
  imports: [CommonModule, TranslateModule, MetaUrlModule, PopupIndicatorPipeModule, LinkStylePipeModule],
  exports: [StaticMsgPurePipe],
})
export class StaticMsgPureModule {}
