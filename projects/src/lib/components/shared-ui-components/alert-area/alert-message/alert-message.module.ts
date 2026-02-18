import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StaticMsgModule } from '../../../../pipes';
import { TranslateModule } from '@ngx-translate/core';
import { AlertMessageComponent } from './alert-message.component';

@NgModule({
  imports: [CommonModule, FormsModule, TranslateModule, StaticMsgModule],
  declarations: [AlertMessageComponent],
  exports: [AlertMessageComponent],
})
export class AlertMessageModule {}
