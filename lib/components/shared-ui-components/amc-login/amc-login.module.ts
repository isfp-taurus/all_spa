import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AmcLoginHeaderComponent } from './amc-login-header.component';
import { AmcLoginComponent } from './amc-login.component';
import { AuthLoginStoreServiceModule } from '@lib/services/auth-login-store/auth-login-store.module';
import { InputModule } from '@lib/components/base-ui-components/form/input/input.module';
import { ButtonModule } from '@lib/components/base-ui-components/button/button.module';
import { TextTooltipModule } from '@lib/components/base-ui-components/tooltip/tooltip.module';
import { StaticMsgModule } from '@lib/pipes/static-msg/static-msg.module';
import { SignalService } from './signal.service';
import { ThrottleClickDirectiveModule } from '@lib/directives';

@NgModule({
  declarations: [AmcLoginComponent, AmcLoginHeaderComponent],
  providers: [SignalService],
  imports: [
    AuthLoginStoreServiceModule,
    CommonModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    InputModule,
    ButtonModule,
    TextTooltipModule,
    StaticMsgModule,
    ThrottleClickDirectiveModule,
  ],
  exports: [AmcLoginComponent, AmcLoginHeaderComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AmcLoginModule {}
