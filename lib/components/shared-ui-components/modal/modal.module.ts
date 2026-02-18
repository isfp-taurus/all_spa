import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { AlertAreaModule } from '../../../components/shared-ui-components/alert-area/alert-area.module';
import { ButtonModule } from '../../../components/base-ui-components/button/button.module';
import { DialogModule } from '../../../components/base-ui-components/dialog/dialog.module';
import { EmergencyAreaModule } from '../../../components/shared-ui-components/emergency-area/emergency-area.module';
import { GuidanceAreaModule } from '../../../components/shared-ui-components/guidance-area/guidance-area.module';
import { ModalBaseComponent } from './modal-base.component';
import { ModalIdTemplateComponent } from './modal-id-template.component';
@NgModule({
  declarations: [ModalBaseComponent, ModalIdTemplateComponent],
  providers: [],
  imports: [
    CommonModule,
    AlertAreaModule,
    GuidanceAreaModule,
    EmergencyAreaModule,
    ButtonModule,
    DialogModule,
    TranslateModule,
  ],
  exports: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
})
export class ModalModule {}
