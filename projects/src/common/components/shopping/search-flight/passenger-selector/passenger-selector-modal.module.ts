import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { PassengerSelectorModalComponent } from './passenger-selector-modal.component';
import { StaticMsgModule } from '@lib/pipes';
import { ThrottleClickDirectiveModule } from '@lib/directives';

@NgModule({
  declarations: [PassengerSelectorModalComponent],
  exports: [PassengerSelectorModalComponent],
  imports: [CommonModule, TranslateModule, StaticMsgModule, ThrottleClickDirectiveModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PassengerSelectorModalModule {}
