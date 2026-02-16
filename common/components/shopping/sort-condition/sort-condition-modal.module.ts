import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SortConditionModalComponent } from './sort-condition-modal.component';
import { TranslateModule } from '@ngx-translate/core';
import { StaticMsgModule } from '@lib/pipes';
import { ThrottleClickDirectiveModule } from '@lib/directives';

@NgModule({
  declarations: [SortConditionModalComponent],
  imports: [CommonModule, TranslateModule, StaticMsgModule, ThrottleClickDirectiveModule],
  exports: [SortConditionModalComponent],
})
export class SortConditionModalModule {}
