import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { StoreModule } from '@ngrx/store';
import { AmcLoginModule } from '../../../components/shared-ui-components/amc-login';
import { AuthorizationServiceModule, HeaderServiceModule, ModalServiceModule } from '../../../services';
import { HeaderComponent } from './header.component';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from '../../../components/base-ui-components/button/button.module';
import { IndicatorPopupModule } from '../../../components/base-ui-components/indicator-popup/indicator-popup.module';
import {
  LinkUrlModule,
  MetaUrlModule,
  StaticMsgModule,
  LinkUrlPipe,
  NumberFormatModule,
  HeaderUrlModule,
  HeaderUrlPipe,
} from '../../../pipes';
import { AnaBizHeaderModule } from '../ana-biz-header/ana-biz-header.module';
import { InformativeSeatmapHeaderModule } from '../informative-seatmap-header/informative-seatmap-header.module';
import { AllSiteDirectiveModule } from '@lib/directives';
import { ThrottleClickDirectiveModule } from '@lib/directives';

@NgModule({
  declarations: [HeaderComponent],
  imports: [
    CommonModule,
    TranslateModule,
    AmcLoginModule,
    ModalServiceModule,
    ButtonModule,
    IndicatorPopupModule,
    MetaUrlModule,
    AuthorizationServiceModule,
    StaticMsgModule,
    AnaBizHeaderModule,
    InformativeSeatmapHeaderModule,
    HeaderServiceModule,
    LinkUrlModule,
    NumberFormatModule,
    StoreModule.forRoot({}),
    AllSiteDirectiveModule,
    ThrottleClickDirectiveModule,
    HeaderUrlModule,
  ],
  providers: [LinkUrlPipe, HeaderUrlPipe],
  exports: [HeaderComponent],
})
export class HeaderModule {}
