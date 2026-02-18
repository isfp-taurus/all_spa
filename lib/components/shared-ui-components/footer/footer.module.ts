import { NgModule } from '@angular/core';
import { FooterComponent } from './footer.component';
import { CommonModule } from '@angular/common';
import { CommonLibModule } from '../../../services';
import { TranslateModule } from '@ngx-translate/core';
import { MetaUrlModule } from '../../../pipes/meta-url/meta-url.module';
import { StaticMsgModule } from '../../../pipes/static-msg/static-msg.module';
import { StaticMsgPureModule } from '../../../pipes/static-msg-pure/static-msg-pure.module';

@NgModule({
  declarations: [FooterComponent],
  imports: [CommonModule, CommonLibModule, TranslateModule, MetaUrlModule, StaticMsgModule, StaticMsgPureModule],
  exports: [FooterComponent],
})
export class FooterModule {}
