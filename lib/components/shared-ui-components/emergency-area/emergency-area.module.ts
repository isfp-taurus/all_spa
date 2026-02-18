import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from '../../../components/base-ui-components/button/button.module';
import { StaticMsgModule } from '../../../pipes';
import { TranslateModule } from '@ngx-translate/core';
import { EmergencyAreaComponent } from './emergency-area.component';

@NgModule({
  declarations: [EmergencyAreaComponent],
  imports: [CommonModule, FormsModule, TranslateModule, ButtonModule, StaticMsgModule],
  exports: [EmergencyAreaComponent],
})
export class EmergencyAreaModule {}
