import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AnaBizLoginStoreServiceModule, AnaBizTopServiceModule } from '@common/services';
import { ButtonModule, CheckboxModule, InputModule, RadiobuttonBoxModule, RadiobuttonModule } from '@lib/components';
import { StaticMsgModule } from '@lib/pipes';
import { AnaBizLoginPresComponent } from './ana-biz-login-pres.component';
import { AnaBizLoginPresService } from './ana-biz-login-pres.service';
import { ThrottleClickDirectiveModule } from '@lib/directives';
import { DialogConfirmModule } from '../sub-components/dialog-confirm';

@NgModule({
  declarations: [AnaBizLoginPresComponent],
  exports: [AnaBizLoginPresComponent],
  imports: [
    CommonModule,
    CheckboxModule,
    RadiobuttonModule,
    RadiobuttonBoxModule,
    StaticMsgModule,
    ButtonModule,
    InputModule,
    FormsModule,
    ReactiveFormsModule,
    AnaBizLoginStoreServiceModule,
    AnaBizTopServiceModule,
    ThrottleClickDirectiveModule,
    DialogConfirmModule,
  ],
  providers: [AnaBizLoginPresService],
})
export class AnaBizLoginPresModule {}
