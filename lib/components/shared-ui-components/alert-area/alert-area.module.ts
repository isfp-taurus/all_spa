import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { AlertMessageStoreServiceModule } from '../../../services';
import { AlertMessageStoreModule } from '../../../store';
import { AlertMessageModule } from './alert-message/alert-message.module';
import { AlertAreaComponent } from './alert-area.component';
import { ErrorGuidanceContModule } from '../error-guidance/container/error-guidance-cont.module';

@NgModule({
  declarations: [AlertAreaComponent],
  imports: [
    CommonModule,
    AlertMessageStoreModule,
    AlertMessageStoreServiceModule,
    AlertMessageModule,
    ErrorGuidanceContModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: [AlertAreaComponent],
})
export class AlertAreaModule {}
