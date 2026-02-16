import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoshokaiNetLoginPresComponent } from './goshokai-net-login-pres.component';
import { DebugLanguageSwitchModule } from '../../../lib/components/shared-ui-components/debug-language-switch/debug-language-switch.module';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule, InputModule, SelectModule } from '@lib/components';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthorizationServiceModule } from '@lib/services';
import { StaticMsgModule } from '@lib/pipes';
import { AnabizAuthorizationServiceModule } from '@common/services/anabiz-authorization/anabiz-authorization.module';
import { ThrottleClickDirectiveModule } from '@lib/directives';

@NgModule({
  declarations: [GoshokaiNetLoginPresComponent],
  exports: [GoshokaiNetLoginPresComponent],
  imports: [
    CommonModule,
    TranslateModule,
    InputModule,
    ButtonModule,
    DebugLanguageSwitchModule,
    SelectModule,
    FormsModule,
    ReactiveFormsModule,
    AuthorizationServiceModule,
    AnabizAuthorizationServiceModule,
    StaticMsgModule,
    ThrottleClickDirectiveModule,
  ],
})
export class GoshokaiNetLoginPresModule {}
