import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PasswordInputComponent } from './password-input.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { PasswordInputHeaderComponent } from './password-input-header.component';
import { ButtonModule, InputModule } from '@lib/components';
import { StaticMsgModule } from '@lib/pipes';
import {
  PasswordInputAuthLoginStoreServiceModule,
  GetCreditPanInformationServiceModule,
} from '../../../../../common/services';

@NgModule({
  declarations: [PasswordInputComponent, PasswordInputHeaderComponent],
  providers: [],
  imports: [
    CommonModule,
    TranslateModule,
    StaticMsgModule,
    FormsModule,
    ReactiveFormsModule,
    InputModule,
    ButtonModule,
    PasswordInputAuthLoginStoreServiceModule,
    GetCreditPanInformationServiceModule,
  ],
  exports: [PasswordInputComponent, PasswordInputHeaderComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PasswordInputModule {}
