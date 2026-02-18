import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from '@lib/components/base-ui-components/button/button.module';
import { IndicatorPopupModule } from '@lib/components/base-ui-components/indicator-popup/indicator-popup.module';
import { AmcLoginModule } from '@lib/components/shared-ui-components/amc-login';
import {
  LinkUrlModule,
  MetaUrlModule,
  LinkUrlPipe,
  NumberFormatModule,
  HeaderUrlModule,
  HeaderUrlPipe,
} from '@lib/pipes';
import { StaticMsgModule } from '@lib/pipes/static-msg/static-msg.module';
import { AuthorizationServiceModule, HeaderServiceModule, ModalServiceModule } from '@lib/services';
import { StoreModule } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { AnaBizHeaderComponent } from './ana-biz-header.component';
import { ThrottleClickDirectiveModule, AllSiteDirectiveModule } from '@lib/directives';

@NgModule({
  declarations: [AnaBizHeaderComponent],
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
    HeaderServiceModule,
    LinkUrlModule,
    NumberFormatModule,
    RouterModule.forChild([{ path: '', component: AnaBizHeaderComponent }]),
    StoreModule.forRoot({}),
    ThrottleClickDirectiveModule,
    HeaderUrlModule,
    AllSiteDirectiveModule,
  ],
  providers: [LinkUrlPipe, HeaderUrlPipe],
  exports: [AnaBizHeaderComponent],
})
export class AnaBizHeaderModule {}
