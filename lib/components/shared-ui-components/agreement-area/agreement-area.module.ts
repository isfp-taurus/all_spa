import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgreementAreaComponent } from './agreement-area.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from '../../base-ui-components/button/button.module';
import { CheckboxModule } from '../../../components/base-ui-components/form/checkbox/checkbox.module';
import { TranslateModule } from '@ngx-translate/core';
import { StaticMsgModule } from '../../../pipes';

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    ButtonModule,
    CheckboxModule,
    FormsModule,
    ReactiveFormsModule,
    StaticMsgModule,
  ],
  declarations: [AgreementAreaComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: [AgreementAreaComponent],
})
export class AgreementAreaModule {}
