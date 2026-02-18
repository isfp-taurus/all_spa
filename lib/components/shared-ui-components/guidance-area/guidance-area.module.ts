import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { StaticMsgModule } from '../../../pipes';
import { TranslateModule } from '@ngx-translate/core';
import { GuidanceAreaComponent } from './guidance-area.component';

@NgModule({
  declarations: [GuidanceAreaComponent],
  imports: [CommonModule, TranslateModule, StaticMsgModule],
  exports: [GuidanceAreaComponent],
})
export class GuidanceAreaModule {}
